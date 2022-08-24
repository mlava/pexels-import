import '@omiu/dialog-extention';

const config = {
    tabTitle: "Pexels embed",
    settings: [
        {
            id: "pexels-apiKey",
            name: "Pexels API key *",
            description: "Your API Key from https://www.pexels.com/api/new/",
            action: { type: "input", placeholder: "Add Pexels API key here" },
        },
        {
            id: "pexels-orientation",
            name: "Image orientation",
            description: "portrait, landscape or square",
            action: { type: "input", placeholder: "landscape" },
        },
        {
            id: "pexels-mode",
            name: "Import mode",
            description: "random or prompt",
            action: { type: "input", placeholder: "random" },
        },
    ]
};

function onload({ extensionAPI }) {
    extensionAPI.settings.panel.create(config);

    window.roamAlphaAPI.ui.commandPalette.addCommand({
        label: "Pexels embed",
        callback: () => fetchPexels({ extensionAPI }).then(string =>
            window.roamAlphaAPI.updateBlock({
                block: {
                    uid: window.roamAlphaAPI.ui.getFocusedBlock()?.["block-uid"],
                    string: string,
                }
            })
        ),
    });
}

function onunload() {
    window.roamAlphaAPI.ui.commandPalette.removeCommand({
        label: 'Pexels embed'
    });
}

async function fetchPexels({ extensionAPI }) {
    var width, display, mode, key, urlPexels;
    breakme: {
        if (!extensionAPI.settings.get("pexels-apiKey")) {
            key = "API";
            sendConfigAlert(key);
        } else {
            const accessKey = extensionAPI.settings.get("pexels-apiKey");
            if (!extensionAPI.settings.get("pexels-orientation")) {
                display = "landscape";
            } else {
                const regexD = /^landscape|portrait|square$/;
                if (extensionAPI.settings.get("pexels-orientation").match(regexD)) {
                    display = extensionAPI.settings.get("pexels-orientation");
                } else {
                    key = "display";
                    sendConfigAlert(key);
                    break breakme;
                }
            }
            if (!extensionAPI.settings.get("pexels-mode")) {
                mode = "random";
            } else {
                const regexM = /^random|prompt$/;
                if (extensionAPI.settings.get("pexels-mode").match(regexM)) {
                    mode = extensionAPI.settings.get("pexels-mode");
                } else {
                    key = "mode";
                    sendConfigAlert(key);
                    break breakme;
                }
            }

            urlPexels = "https://api.pexels.com/v1/search";
            document.pexelsURL = "";
            var thisBlock = await window.roamAlphaAPI.ui.getFocusedBlock()?.["block-uid"];

            var myHeaders = new Headers();
            myHeaders.append("Authorization", accessKey);
            var requestOptions = {
                method: 'GET',
                headers: myHeaders,
                redirect: 'follow'
            };

            if (mode == "prompt") {
                Omiu.prompt({
                    msg: 'What mood | mode | theme do you want?',
                    title: 'Pexels import',
                    cancelButtonText: 'Cancel',
                    confirmButtonText: 'OK',
                    onCancel: function () {
                        alert("You cancelled the search")
                    },
                    onConfirm: async function (val) {
                        urlPexels += "?query=" + val + "";
                        urlPexels += "&orientation=" + display + "&per_page=1";
                        const response = await fetch(urlPexels, requestOptions);
                        const pexels = await response.json();
                        console.info(response, pexels);
                        if (response.ok) {
                            var string = "![](" + pexels.photos[0].src.original + ")\n'" + val + "' image by [[" + pexels.photos[0].photographer + "]] at [Pexels](" + pexels.photos[0].photographer_url + ")";
                            await window.roamAlphaAPI.updateBlock({
                                block: { uid: thisBlock, string: string, open: true }
                            })
                        } else {
                            console.log(data);
                        }
                    }
                });
            } else {
                urlPexels = "https://api.pexels.com/v1/curated?per_page=1";
                urlPexels += "&orientation=" + display + "";
                const response = await fetch(urlPexels, requestOptions);
                const pexels = await response.json();
                if (response.ok) {
                    var string = "![](" + pexels.photos[0].src.original + ")\n Image by [[" + pexels.photos[0].photographer + "]] at [Pexels](" + pexels.photos[0].photographer_url + ")";
                    return (string);
                } else {
                    console.log(data);
                }
            }
        };
    }
}

function sendConfigAlert(key) {
    if (key == "API") {
        alert("Please set the API key in the configuration settings via the Roam Depot tab.");
    } else if (key == "display") {
        alert("Please set the display mode to either landscape, portrait or squarish in the configuration settings via the Roam Depot tab.");
    } else if (key == "mode") {
        alert("Please set the import mode to either random or prompt in the configuration settings via the Roam Depot tab.");
    }
}

export default {
    onload: onload,
    onunload: onunload
};