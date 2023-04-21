const {
  app,
  BrowserWindow,
  ipcMain
} = require('electron')
const path = require('path')
const url = require('url')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win

function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: 1920,
    height: 1080,
    webPreferences: {
      contextIsolation: false,
      preload: path.join(__dirname, 'preload.js')
    }
  })
  // 生产环境
//  win.loadURL('http://generator-plus.buukle.top/generator-plus/');
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

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", async () => {
  createWindow()
 //接受到下载信号开始下载
  ipcMain.on("download", (event, info) => {
    directory = info.directory
    win.webContents.downloadURL(info.url);
    //监听下载
        win.webContents.session.on("will-download",
        (event, item, webcontent) => {
        	//设置下载文件名
          item.setSavePath(directory)
          item.on('updated', (event, state) => {
            // 下载的事件
            if (state === "progressing") {
              if (!item.isPaused()) {
              //下载完成后传回进度
                win.webContents.send("downing",
                item.getReceivedBytes() * 100 / item.getTotalBytes())
              }
            }
          })
          item.once('done', (event, state) => {
            // 下载完成的事件
            if (state === "completed") {
            //下载完成后传回进度
              win.webContents.send("downing", 100)
            }
          })
        })
  });
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
