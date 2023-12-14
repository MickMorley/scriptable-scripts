// Inspiration from https://github.com/awaescher/home-battery-widget/blob/main/widget.js
// Simple Home Assistant (HASS) iOS Gauge Lock Screen Widget via Scriptable App


const widget = new ListWidget();

// Get data from HASS
let result = await loadValues();

// Check data quality
let percent = result.value;
let isValid = !Number.isNaN(percent);

if (!isValid) {
    percent = 0;
}

// Build widget
let progressStack = await progressCircle(widget, percent);

// Tiny house or triangle
const mainIconName = isValid ? "house.fill" : "exclamationmark.triangle";

let mainIcon = SFSymbol.named(mainIconName);
mainIcon.applyFont(Font.regularSystemFont(26));
mainIcon = progressStack.addImage(mainIcon.image);
const mainImageSize = 30;
mainIcon.imageSize = new Size(mainImageSize, mainImageSize);
mainIcon.tintColor = new Color("#fafafa");

// Tiny bolt (lightning strike) icon
const badgeName = "bolt.fill";
let badgeIcon = SFSymbol.named(badgeName);
badgeIcon.applyFont(Font.regularSystemFont(26));
badgeIcon = progressStack.addImage(badgeIcon.image);
badgeIcon.imageSize = new Size(12, 12);
badgeIcon.tintColor = new Color("#fafafa");

// iOS 16 gauge widget on lock screen
widget.presentAccessoryCircular();
// or classical widget? You need to decide.
widget.backgroundColor = new Color("#7c7c7c", 1.0);
//widget.presentSmall();

Script.setWidget(widget);
Script.complete();

// color = "hsl(0, 0%, 100%)",
async function progressCircle(
    on,
    value = 50,
    color = "hsl(0, 0%, 100%)",
    background = "hsl(0, 0%, 10%)",
    size = 60,
    barWidth = 5.5
) {
    if (value > 1) {
        value /= 100
    }
    if (value < 0) {
        value = 0
    }
    if (value > 1) {
        value = 1
    }

    // https://htmlcolors.com/hex-to-hsl
    if (value > 0.0 && value < 0.25) {
      color = "hsl(0, 100%, 50%)"; // red
    } else if (value >= 0.25 && value < 0.75) {
      color = "hsl(54, 100%, 50%)"; // yellow
    } else {
      color = "hsl(120, 100%, 50%)"; // green
    }

    // Change colors in dark mode
    async function isUsingDarkAppearance() {
        return !Color.dynamic(Color.white(), Color.black()).red;
    }
    let isDark = await isUsingDarkAppearance();

    if (color.split("-").length > 1) {
        if (isDark) {
            color = color.split("-")[1];
        } else {
            color = color.split("-")[0];
        }
    }

    if (background.split("-").length > 1) {
        if (isDark) {
            background = background.split("-")[1];
        } else {
            background = background.split("-")[0];
        }
    }

    let w = new WebView()
    await w.loadHTML('<canvas id="c"></canvas>');

    // The magic gauge, filled with 'value'
    let base64 = await w.evaluateJavaScript(
   `let color = "${color}",
    background = "${background}",
    size = ${size}*3,
    lineWidth = ${barWidth}*3,
    percent = ${value * 100}
    let canvas = document.getElementById('c'),
    c = canvas.getContext('2d')
    canvas.width = size
    canvas.height = size
    let posX = canvas.width / 2,
    posY = canvas.height / 2,
    onePercent = 360 / 100,
    result = onePercent * percent
    c.lineCap = 'round'
    c.beginPath()
    c.arc( posX, posY, (size-lineWidth-1)/2, (Math.PI/180) * 270, (Math.PI/180) * (270 + 360) )
    c.strokeStyle = background
    c.lineWidth = lineWidth 
    c.stroke()
    c.beginPath()
    c.strokeStyle = color
    c.lineWidth = lineWidth
    c.arc( posX, posY, (size-lineWidth-1)/2, (Math.PI/180) * 270, (Math.PI/180) * (270 + result) )
    c.stroke()
    completion(canvas.toDataURL().replace("data:image/png;base64,",""))`, true);
    const image = Image.fromData(Data.fromBase64String(base64));

    // Add gauge to widget
    let stack = on.addStack();
    stack.size = new Size(size, size);
    stack.backgroundImage = image;
    stack.centerAlignContent();
    let padding = barWidth * 2;
    stack.setPadding(padding, padding, padding, padding);

    return stack;
}

// Get data from HASS
async function loadValues() {

    let req = new Request("https://<HASS IP>/api/states");
    req.headers = { "Authorization": "Bearer <HASS Long-Lived Access Token at https://<HASS IP>/profile", "content-type": "application/json" };
    let json = await req.loadJSON();

    // Edit this, add your sensor
    let result = { name: 'sensor.your_sensor_of_interest', value: -1 };

    // Search through HASS data find sensor and its current value
    var i;
    for (i = 0; i < json.length; i++) {
        if (json[i]['entity_id'] == result.name) {
            result.value = json[i]['state'];
        }
    }

    // Testing / Debugging
    //result.value = 30;

    console.log(result);
    return result;
}
