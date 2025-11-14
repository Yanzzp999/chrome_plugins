// 获取DOM元素
const downloadList = document.getElementById('downloadList');
const loadingIndicator = document.getElementById('loadingIndicator');
const emptyState = document.getElementById('emptyState');
const searchBtn = document.getElementById('searchBtn');
const closeSearchBtn = document.getElementById('closeSearchBtn');
const searchContainer = document.getElementById('searchContainer');
const searchInput = document.getElementById('searchInput');
const openFolderBtn = document.getElementById('openFolderBtn');
const menuBtn = document.getElementById('menuBtn');
const pinBtn = document.getElementById('pinBtn');

let allDownloads = [];
let filteredDownloads = [];

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  loadDownloads();
  setupEventListeners();
});

// 设置事件监听器
function setupEventListeners() {
  // 搜索功能
  searchBtn.addEventListener('click', () => {
    const isHidden = searchContainer.classList.toggle('hidden');
    if (!isHidden) {
      searchInput.focus();
    }
  });

  closeSearchBtn.addEventListener('click', () => {
    if (!searchContainer.classList.contains('hidden')) {
      searchContainer.classList.add('hidden');
    }
    searchInput.value = '';
    filteredDownloads = [...allDownloads];
    renderDownloads();
  });

  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    if (query === '') {
      filteredDownloads = [...allDownloads];
    } else {
      filteredDownloads = allDownloads.filter(download => 
        download.filename.toLowerCase().includes(query)
      );
    }
    renderDownloads();
  });

  // 打开下载文件夹
  openFolderBtn.addEventListener('click', () => {
    chrome.downloads.showDefaultFolder();
  });

  // 菜单按钮（预留功能）
  menuBtn.addEventListener('click', () => {
    // TODO: 实现菜单功能
    console.log('菜单功能待实现');
  });

  // 固定按钮（预留功能）
  pinBtn.addEventListener('click', () => {
    // TODO: 实现固定功能
    console.log('固定功能待实现');
  });
}

// 加载下载记录
function loadDownloads() {
  loadingIndicator.classList.remove('hidden');
  emptyState.classList.add('hidden');
  downloadList.innerHTML = '';

  // 查询所有下载记录
  chrome.downloads.search({}, (downloads) => {
    if (chrome.runtime.lastError) {
      console.error('获取下载记录失败:', chrome.runtime.lastError);
      loadingIndicator.classList.add('hidden');
      emptyState.classList.remove('hidden');
      return;
    }

    // 按时间倒序排序
    downloads.sort((a, b) => {
      const timeA = a.startTime ? new Date(a.startTime).getTime() : 0;
      const timeB = b.startTime ? new Date(b.startTime).getTime() : 0;
      return timeB - timeA;
    });

    allDownloads = downloads;
    filteredDownloads = [...allDownloads];

    // 检查每个文件是否存在
    checkFilesExistence(downloads).then(() => {
      loadingIndicator.classList.add('hidden');
      if (filteredDownloads.length === 0) {
        emptyState.classList.remove('hidden');
      } else {
        emptyState.classList.add('hidden');
        renderDownloads();
      }
    });
  });
}

// 检查文件是否存在
async function checkFilesExistence(downloads) {
  // Chrome Downloads API 的 exists 属性可以准确反映文件是否存在
  // 如果文件被删除，exists 会被设置为 false
  downloads.forEach(download => {
    // 文件存在需要满足以下条件：
    // 1. 下载状态为 complete（完成）
    // 2. exists 属性不为 false（文件未被删除）
    // 注意：Chrome 会在文件被删除后将 exists 设置为 false
    if (download.state === 'complete' && download.exists !== false) {
      download.fileExists = true;
    } else {
      download.fileExists = false;
    }
  });
}

// 渲染下载列表
function renderDownloads() {
  downloadList.innerHTML = '';

  if (filteredDownloads.length === 0) {
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');
  loadingIndicator.classList.add('hidden');

  filteredDownloads.forEach(download => {
    const listItem = createDownloadItem(download);
    downloadList.appendChild(listItem);
  });
}

// 创建下载项元素
function createDownloadItem(download) {
  const li = document.createElement('li');
  li.className = 'download-item';

  const fileName = download.filename ? download.filename.split('/').pop() : '未知文件';
  const fileExtension = fileName.includes('.') ? fileName.split('.').pop().toLowerCase() : '';
  const fileIcon = getFileIcon(fileExtension);
  const fileExists = download.fileExists === true;

  li.innerHTML = `
    <div class="download-item-header">
      <div class="file-icon ${fileExtension}">${fileIcon}</div>
      <div class="file-info">
        <div class="file-name" title="${fileName}">${fileName}</div>
        <div class="file-status ${fileExists ? '' : 'deleted'}">
          ${fileExists ? formatFileSize(download.totalBytes) + ' • ' + formatDate(download.startTime) : '已删除'}
        </div>
      </div>
      <div class="file-actions">
        ${fileExists ? `<a href="#" class="action-link open-file" data-id="${download.id}">打开文件</a>` : ''}
      </div>
    </div>
  `;

  // 添加打开文件事件
  const openFileLink = li.querySelector('.open-file');
  if (openFileLink) {
    openFileLink.addEventListener('click', (e) => {
      e.preventDefault();
      openFile(download.id);
    });
  }

  // 点击整个项也可以打开文件（如果存在）
  if (fileExists) {
    li.addEventListener('click', (e) => {
      if (!e.target.classList.contains('action-link')) {
        openFile(download.id);
      }
    });
  }

  return li;
}

// 获取文件图标
function getFileIcon(extension) {
  const iconMap = {
    'pdf': 'PDF',
    'dmg': 'DMG',
    'zip': 'ZIP',
    'pptx': 'PPT',
    'ppt': 'PPT',
    'docx': 'DOC',
    'doc': 'DOC',
    'xlsx': 'XLS',
    'xls': 'XLS',
    'jpg': 'IMG',
    'jpeg': 'IMG',
    'png': 'IMG',
    'gif': 'IMG',
    'mp4': 'VID',
    'mp3': 'AUD',
  };
  return iconMap[extension] || 'FILE';
}

// 格式化文件大小
function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '未知大小';
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

// 格式化日期
function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours === 0) {
      const minutes = Math.floor(diff / (1000 * 60));
      return minutes <= 0 ? '刚刚' : `${minutes}分钟前`;
    }
    return `${hours}小时前`;
  } else if (days === 1) {
    return '昨天';
  } else if (days < 7) {
    return `${days}天前`;
  } else {
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  }
}

// 打开文件
function openFile(downloadId) {
  chrome.downloads.open(downloadId, (result) => {
    if (chrome.runtime.lastError) {
      console.error('打开文件失败:', chrome.runtime.lastError);
      // 如果文件不存在，更新状态
      const download = allDownloads.find(d => d.id === downloadId);
      if (download) {
        download.fileExists = false;
        renderDownloads();
      }
    }
  });
}

