document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.local.get(['isRecording'], (result) => {
      updateStatus(result.isRecording === true);
    });
  });
  
  document.getElementById('btnStart').addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: "clear_logs" });
  
    chrome.storage.local.set({ isRecording: true });
    updateStatus(true);
  });
  
  document.getElementById('btnStop').addEventListener('click', () => {
    chrome.storage.local.set({ isRecording: false });
    updateStatus(false);
  });
  
  document.getElementById('btnDownload').addEventListener('click', () => {
    chrome.storage.local.get(['masterLogs'], (result) => {
      const data = result.masterLogs || [];
      if (data.length > 0) {
        downloadJSON(data);
      } else {
        alert("No data collected yet. (Try browsing first)");
      }
    });
  });
  
  function updateStatus(isRec) {
    const status = document.getElementById('status');
    if (isRec) {
      status.innerText = "Status: RECORDING (Global)";
      status.className = "recording";
    } else {
      status.innerText = "Status: Idle";
      status.className = "idle";
    }
  }
  
  function downloadJSON(data) {
    const blob = new Blob([JSON.stringify(data, null, 2)], {type: "application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `full_session_data_${Date.now()}.json`;
    a.click();
  }