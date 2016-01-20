var rotationTime = 20.0;
var color = [0,0,255];
var hueChange = 60.0;
var blobs = 5;
var baseColorChange = false;
var baseColorRangeLeft = 0.0;
var baseColorRangeRight = 360.0;
var baseColorChangeRate = 10.0;

if((baseColorRangeRight > baseColorRangeLeft && (baseColorRangeRight -baseColorRangeLeft)) < 10 || (baseColorRangeLeft > baseColorRangeRight && ((baseColorRangeRight + 360) - baseColorRangeLeft) <10))){
	baseColorChange = false;
}


var fullColorWheelAvailable = (baseColorRangeRight % 360) == (baseColorRangeLeft % 360);
var baseColorChangeIncreaseValue = 1.0 / 360.0;
var hueChange /= 360.0;
var baseColorRangeLeft = (baseColorRangeLeft / 360.0);
var baseColorRangeRight = (baseColorRangeRight / 360.0);
var rotationTime = max(0.1, rotationTime);
var hueChange = max(0.0, min(abs(hueChange), .5));
var blobs = max(1, blobs);
var baseColorChangeRate = max(0, baseColorChangeRate);
var baseHsv = colorsys.rgb_to_hsv(color[0]/255.0, color[1]/255.0, color[2]/255.0)
var colorData = Array()
for (var i = 0; i <= maxLED; i++) {
	var hue = (baseHsv[0] + hueChange * math.sin(2*math.pi * i / hyperion.ledCount)) % 1.0;
	var rgb = colorsys.hsv_to_rgb(hue, baseHsv[1], baseHsv[2]);
	colorData += bytearray((int(255*rgb[0]), int(255*rgb[1]), int(255*rgb[2])));
};

var sleepTime = 0.1;
var amplitudePhaseIncrement = blobs * math.pi * sleepTime / rotationTime;
var colorDataIncrement = 3;
var baseColorChangeRate /= sleepTime;

var amplitudePhase = 0.0;
var rotateColors = false;
var baseColorChangeStepCount = 0;
var baseHSVValue = baseHsv[0];
var numberOfRotates = 0;


while not hyperion.abort():
    if (baseColorChange){
        if (baseColorChangeStepCount >= baseColorChangeRate){
        	baseColorChangeStepCount = 0
            if(fullColorWheelAvailable){
                baseHSVValue = (baseHSVValue + baseColorChangeIncreaseValue) % baseColorRangeRight
            }else{
                if (baseColorChangeIncreaseValue < 0 and baseHSVValue > baseColorRangeLeft and (baseHSVValue + baseColorChangeIncreaseValue) <= baseColorRangeLeft){
                    baseColorChangeIncreaseValue = abs(baseColorChangeIncreaseValue);
                }
                else if (baseColorChangeIncreaseValue > 0 and baseHSVValue < baseColorRangeRight and (baseHSVValue + baseColorChangeIncreaseValue)  >= baseColorRangeRight){
                    baseColorChangeIncreaseValue = -abs(baseColorChangeIncreaseValue);
                }
                baseHSVValue = (baseHSVValue + baseColorChangeIncreaseValue) % 1.0
            }
        }

    }
         

            # update color values
            colorData = bytearray()
            for i in range(hyperion.ledCount):
                hue = (baseHSVValue + hueChange * math.sin(2*math.pi * i / hyperion.ledCount)) % 1.0
                rgb = colorsys.hsv_to_rgb(hue, baseHsv[1], baseHsv[2])
                colorData += bytearray((int(255*rgb[0]), int(255*rgb[1]), int(255*rgb[2])))

            # set correct rotation after reinitialisation of the array
            colorData = colorData[-colorDataIncrement*numberOfRotates:] + colorData[:-colorDataIncrement*numberOfRotates]

        baseColorChangeStepCount += 1

    # Calculate new colors
    for i in range(hyperion.ledCount):
        amplitude = max(0.0, math.sin(-amplitudePhase + 2*math.pi * blobs * i / hyperion.ledCount))
        colors[3*i+0] = int(colorData[3*i+0] * amplitude)
        colors[3*i+1] = int(colorData[3*i+1] * amplitude)
        colors[3*i+2] = int(colorData[3*i+2] * amplitude)

    # set colors
    hyperion.setColor(colors)

    # increment the phase
    amplitudePhase = (amplitudePhase + amplitudePhaseIncrement) % (2*math.pi)

    if rotateColors:
        colorData = colorData[-colorDataIncrement:] + colorData[:-colorDataIncrement]
        numberOfRotates = (numberOfRotates +  1) % hyperion.ledCount
    rotateColors = not rotateColors

    # sleep for a while
    time.sleep(sleepTime)