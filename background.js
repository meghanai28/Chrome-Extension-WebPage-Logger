chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  
    if (request.action === "log_batch") {
      saveBatch(request.data);
    } else if (request.action === "clear_logs") {
      chrome.storage.local.set({ masterLogs: [] });
    }
  
    return true;
  });
  
  function saveBatch(newEvents) {
    if (!newEvents || newEvents.length === 0) return;
  
    chrome.storage.local.get(['masterLogs'], (result) => {
      let currentLogs = result.masterLogs || [];
      
      const updatedLogs = currentLogs.concat(newEvents);
      
      chrome.storage.local.set({ masterLogs: updatedLogs });
    });
  }