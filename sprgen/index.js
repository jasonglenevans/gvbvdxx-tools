var makeButton = document.getElementById("make");
var jsonposCheck = document.getElementById("jsonpos");
var height = document.getElementById("height");
var prev = document.getElementById("prev");
var fileselect = document.getElementById("file");
var download = document.getElementById("download");
var jsonFile = document.getElementById("jsonFile");
var ctx = prev.getContext("2d");
var spritePreview = document.getElementById("prevsprite");
var sprCTX = prevsprite.getContext("2d"); 

function makeSprites(canvas,context,images) {
	var jsonOut = {spriteSheetWidth:0,spriteSheetHeight:0,sprites:[]};
	var spriteMaxRight = 8;
	var spriteRightCount = 0;
	var putX = 0;
	var putY = 0;
	var spacingValue = 1;
	for (var image of images) {
		spriteRightCount += 1;
		var sizeMultiplier = 1;
		if (!(spriteRightCount > spriteMaxRight)) {
			putX += image.width*sizeMultiplier;
			putX -= image.width/-2;
			putX += spacingValue;
		} else {
			putX = image.width/2;
			spriteRightCount = 0;
			putY += image.height*sizeMultiplier;
			putY -= image.height/-2;
			putY += spacingValue;

		}
		if (putX+image.width*sizeMultiplier+spacingValue > jsonOut.spriteSheetWidth) {
			jsonOut.spriteSheetWidth = putX+image.width*sizeMultiplier+spacingValue;
		}
		if (putY+image.height*sizeMultiplier+spacingValue > jsonOut.spriteSheetHeight) {
			jsonOut.spriteSheetHeight = putY+image.height*sizeMultiplier+spacingValue;
		}
		jsonOut.sprites.push({x:putX,y:putY,width:image.width,height:image.height,name:image.name});
	}
	//draw the sprites
	canvas.width = jsonOut.spriteSheetWidth;
	canvas.height = jsonOut.spriteSheetHeight;
	var imageIndex = 0;
	for (var sprite of jsonOut.sprites) {
		//console.log(images[imageIndex]);
		var file = images[imageIndex];
		context.drawImage(file,sprite.x,sprite.y,sprite.width,sprite.height);
		imageIndex += 1;
	}
	
	return jsonOut;
}
function timeoutAsync(secs) {
	return new Promise((accept) => {
		setTimeout(accept,secs*1000); //1000ms = 1second
	})
}
function tickAsync(secs) {
	return new Promise((accept) => {
		setTimeout(accept,1);
	})
}
function loadImages(imgFiles) {
	return new Promise(async (accept) => {
		var loadedImages = 0;
		var imagesData = [];
		for (var filePath of imgFiles) {
			var imageData = document.createElement("img");
			//console.log(filePath);
			imageData.src = filePath;
			await timeoutAsync(0.2);
			loadedImages += 1;
			imagesData.push(imageData);
			//console.log(`Loaded Image #${loadedImages}`);
			if (imgFiles.length == imagesData.length) {	
				accept(imagesData);
			}
		}
	})
}
function blobToURL(file) {
	return new Promise((resolve,reject) => {
		var reader = new FileReader();
		reader.readAsDataURL(file);
		reader.onload = async function () {
			resolve(reader.result);
		};
	});
}

fileselect.onchange = async function () {
	var imagePaths = [];
	for (const file of fileselect.files) {
		var url = await blobToURL(file);
		imagePaths.push(url);
	}
	//console.log(imagePaths);
	var imagesFiles = await loadImages(imagePaths);
	window.spriteSheetImages = imagesFiles;
	var imageCount = 0;
	for (const file of fileselect.files) {
		imagesFiles[imageCount].name = file.name;
		imageCount += 1;
	}
	window.jsonData = makeSprites(prev,ctx,imagesFiles);
	jsonFile.value = JSON.stringify(jsonData,null,"\t");
};
window.jsonData = {sprites:[]};
window.spriteSheetImages = [];
download.onclick = function () {
	var a = document.createElement("a");
	a.href = prev.toDataURL();
	a.download = "spritesheet.png";
	a.click();
};
var spriteCount = 0;
(async function () {
	
	while (true) {
		await tickAsync();
		await timeoutAsync(0.1);
		try{
			
			spritePreview.width = window.jsonData.sprites[spriteCount].width;
			spritePreview.height = window.jsonData.sprites[spriteCount].height;
			var spr = window.jsonData.sprites[spriteCount];
			sprCTX.drawImage(prev,spr.x,spr.y,spr.width,spr.height,0,0,spr.width,spr.height)
			if (spriteCount > window.jsonData.sprites.length-2) {
				spriteCount = 0;
				//console.log("spriteA");
			}
			spriteCount += 1;
		}catch(e){console.error(e);}
	}
})();