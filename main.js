const {
  app,
  BrowserWindow,
  ipcMain
} = require('electron')
const path = require('path')
const url = require('url')
//引入文件操作模块
const fs = require('fs')
//引入unzip模块
const unzip = require("node-unzip-2")

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win,directory,type,obj

function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: 1600,
    height: 800,
    webPreferences: {
      contextIsolation: false,
      preload: path.join(__dirname, 'preload.js')
    }
  })
  // 生产环境
  // win.loadURL('http://test-generator-plus.buukle.top/generator-plus/');
  // 本地环境
  win.loadURL('http://local.test-generator-plus.buukle.top:8000/generator-plus/');
  // Open the DevTools.
  // win.webContents.openDevTools()

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null
  })
}

function reName(nowPath){
  fs.readdir(nowPath,function(err,files){
    for(var i in files){
      const file = files[i];
      const fildir = path.join(nowPath,file);
      fs.stat(fildir,function(eror,stats){
        if(eror){
          console.warn(eror)
        }else{
          if(stats.isDirectory()){
            let newName = fildir.replace("\\targetGeneratedFile","")
            try {
              fs.accessSync(newName);
            } catch (error) {
              fs.mkdirSync(newName);
            }
            reName(fildir)
          }
          if(stats.isFile()){
            let newName = fildir.replace("\\targetGeneratedFile","")
            fs.renameSync(fildir,newName)
          }
        }
      })
    }
  })
}

function unzipSync(directory,dirLocation) {
  return new Promise((resolve, reject) => {
    fs.createReadStream(directory).pipe(unzip.Extract({ path: dirLocation})).on('close', () => {
      console.log('stream close')
      resolve()
    }).on('error', (err) => {
      reject(err)
    })
  })
}

function sleep(ms) {
  return new Promise(resolve=>setTimeout(resolve, ms))
}

function deleteall(path) {
  var files = [];
  if(fs.existsSync(path)) {
    files = fs.readdirSync(path);
    files.forEach(function(file, index) {
      var curPath = path + "/" + file;
      if(fs.statSync(curPath).isDirectory()) { // recurse
        deleteall(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
};
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", async () => {
  createWindow()
  //接受到下载信号开始下载
  ipcMain.on("common-download", (event, info) => {
    type = info.type
    obj = info.obj
    directory = info.directory
    win.webContents.downloadURL(info.url);
  });

  //监听下载
  win.webContents.session.on("will-download",(event, item, webcontent) => {
      //设置下载文件名
      item.setSavePath(directory)
      item.on('updated', (event, state) => {
        // 下载的事件
        if (state === "progressing") {
          if (!item.isPaused()) {
            let per = item.getReceivedBytes() * 100 / item.getTotalBytes()
            win.webContents.send("common-download-ing-callback",type, obj,  Math.floor(per * 100) / 100)
          }
        }
        if (state === "interrupted") {
          if (!item.isPaused()) {
            win.webContents.send("common-download-fail-callback",type, obj, directory)
          }
        }
      })
      item.once('done',  async (event, state) => {
        // 下载完成的事件
        if (state === "completed") {
          // 下载完成后传回进度
          win.webContents.send("common-download-success-callback", type, obj ,directory)
          // 同步解压
          try {
            await unzipSync(directory,obj.dirLocation)

            await sleep(500)
            // 移动文件
            await reName(obj.dirLocation + '/targetGeneratedFile')

            await sleep(500)
            // 删除文件夹
            await deleteall(obj.dirLocation + '/targetGeneratedFile')
            await fs.unlinkSync(obj.dirLocation + '//copy.bat')
            await fs.unlinkSync(directory)
            // 解压移动完成后传回进度
            await win.webContents.send("common-unzip-success-callback", type, obj ,directory)
          } catch (e) {
            await win.webContents.send("common-unzip-fail-callback", type, obj ,JSON.stringify(e))
          }
        }
      })
    })
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
