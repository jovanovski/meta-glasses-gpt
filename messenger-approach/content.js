function monitorElements() {
    const targetNode = document.getElementsByClassName("x78zum5 xdt5ytf x1iyjqo2 xs83m0k x1xzczws x6ikm8r x1rife3k x1n2onr6 xh8yej3")[1]?.childNodes[2];

    if (!targetNode) {
        console.log("Target node not found");
        alert("ERROR: Node not found, reload extension!");
        return;
    }

    alert("ChatGPT on Meta Glasses: Monitoring for new messages");
    const config = { childList: true, subtree: true };
    const callback = function (mutationsList, observer) {
        for (const mutation of mutationsList) {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(node => {
                    if (node.classList.contains("x1n2onr6")) {
                        let query;
                        // Check if it's an image, and get the link, otherwise get the text from the new message node
                        let imageNodes = node.getElementsByClassName("x1lliihq x193iq5w x5yr21d xh8yej3");
                        if (imageNodes.length == 1) {
                            query = imageNodes[0].src;
                        }
                        else {
                            query = node.children[0].getElementsByClassName("x78zum5 xh8yej3")[0].innerText;
                        }
                        browser.runtime.sendMessage({ action: "sendData", data: query });
                    }
                });
            }
        }
    };

    const observer = new MutationObserver(callback);
    observer.observe(targetNode, config);
}

setTimeout(function () {
    // Start monitoring when the DOM is fully loaded
    if (document.readyState === "complete" || document.readyState === "interactive") {
        monitorElements();
    } else {
        window.addEventListener("DOMContentLoaded", monitorElements);
    }
}, 3000);
