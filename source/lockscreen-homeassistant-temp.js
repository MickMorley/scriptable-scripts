//  Home Assistant Lockscreen Widget

// Confguration
// EDIT HERE
 
const hassUrl = "<hass base url>"
const hassToken = "<your long lived Bearer token>"

let widget = await createWidget();
if (!config.runsInWidget) {
    await widget.presentSmall();
}

Script.setWidget(widget);
Script.complete();

async function createWidget(items) {
    let req = new Request(`${hassUrl}/api/states`)
    req.headers = { 
        "Authorization": `Bearer ${hassToken}`, 
        "content-type": "application/json" 
    }
    let json = await req.loadJSON();
 
    /* Parse data received from API */
    let data = {livingroom: {}}
 
    data.livingroom = addData(json, data.livingroom, ['sensor.living_room_temperature', 'sensor.living_room_humidity']);
 
    /* Create the widget */
    const widget = new ListWidget();
    widget.backgroundColor = new Color("#03a9f4", 1.0);
 
    /* Add the sensor entries */
    const bodyStack = widget.addStack();
 
    /* First, the label column */
    const labelStack = bodyStack.addStack();
    labelStack.centerAlignContent();
    labelStack.setPadding(0, 0, 0, 0);
    labelStack.borderWidth = 0;
    labelStack.size = new Size(50,50);
    addLabel(labelStack, "🛋️")
 
    /* Second, the temperature column */
    const tempStack = bodyStack.addStack();
    tempStack.centerAlignContent();
    tempStack.setPadding(0, 11, 0, 0);
    tempStack.borderWidth = 0;
    tempStack.size = new Size(0,50);
    tempStack.layoutVertically();
 
    tempStack.addText(" 🌡️")
    addTemp(tempStack, data.livingroom)
 
    /* Third, the humidity column */
    const humidStack = bodyStack.addStack();
    humidStack.centerAlignContent();
    humidStack.setPadding(0, 5, 0, 0);
    humidStack.borderWidth = 0;
    humidStack.size = new Size(0,50);
    humidStack.layoutVertically();
 
    humidStack.addText("💧")
    addHumid(humidStack, data.livingroom)
 
    /* Done: Widget is now ready to be displayed */
    return widget;
}
 
/* Adds the entries to the label column */
async function addLabel(labelStack, label) {
    const mytext = labelStack.addText(label);
    mytext.font = Font.semiboldSystemFont(40);
    mytext.textColor = Color.black();
}
 
/* Adds the entries to the temperature column */
async function addTemp(tempStack, data) {
    const mytext = tempStack.addText(data.temp + "°C");
    mytext.font = Font.heavyMonospacedSystemFont(13);
    mytext.textColor = Color.white();
}
 
/* Adds the entries to the humidity column */
async function addHumid(humidStack, data) {
    const mytext = humidStack.addText(data.humid + "%");
    mytext.font = Font.mediumMonospacedSystemFont(13);
    mytext.textColor = Color.white();
    mytext.textOpacity = 0.8;
}
 
/* Searches for the respective sensor values ('state') in the API response of Home Assistant */
function addData(json, room, sensors) {
    room.temp = "N/A";
    room.humid = "N/A";
    var i;
    for (i = 0; i < json.length; i++) {
        if (json[i]['entity_id'] == sensors[0]) {
            room.temp = Number(json[i]['state']);
            room.temp = room.temp.toFixed(1);
        }
        if (json[i]['entity_id'] == sensors[1]) {
            room.humid = Math.round(json[i]['state']);
        }
    }
    return room;
}
