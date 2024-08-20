import fs from 'fs'
import {PNG} from "pngjs"


export const loadPNG = (path) => new Promise((resolve)=>{
	if(!fs.existsSync(path)) return resolve({
		error: "File not found"
	})

	const stream = fs.createReadStream(path);
	const png = new PNG({filterType:4})
	stream.pipe(png)
		.on("parsed", function(){
			resolve({png:this})
		})
		.on("error",function(err){
            console.error(err)
			resolve({error: "Parse Error!"})
		})
})


export const getTopNColorsPNG = (png,n) => {
	//"simplify" the png
	pixelate(png,50);
	const freq = {}
	for(let y = 0; y < png.height; y++){
		for(let x = 0; x < png.width; x++){
			const i  = (png.width*y+x)<<2
			const rgba = [png.data[i],png.data[i+1],png.data[i+2],png.data[i+3]].join(",")
			if(!freq[rgba]) freq[rgba] = 1
			else freq[rgba]++
		}
	}

	const frequencyEntries = []
	for(const rgba in freq)	frequencyEntries.push([rgba,freq[rgba]])
	
	frequencyEntries.sort((a,b)=>b[1]-a[1])
	const N = Math.min(frequencyEntries.length, n)
	return frequencyEntries.slice(0,N).map(([rgba,n])=>{
		let [r,g,b] = rgba.split(",").map(Number)
		const percent = ((n/(png.width*png.height))*100).toFixed(2)
		return { r,g,b , percent }
	})
}

export const cli = async () => {
	const pathToPng = process.argv[2], n = parseInt(process.argv[3],10)
	if(!pathToPng || !n){
		console.error("[FATAL] no path to img provided")
		process.exit(1)
	}
	const { png, error } = await this.loadPNG(pathToPng)
	if(png){
		const topN = this.getTopNColors(png,n)
		for(let i = 0; i < topN.length; i++){
			const { r,g,b, percent} = topN[i]
			console.log(`${i+1}) rgb(${r},${g},${b}) -> ${percent}%`)

		}

	} else { 
		console.error(error)
	}
}




export const pixelate = (png,cellPx=5) => {
	for(let y = 0; y < png.height; y+=cellPx){
		for(let x = 0; x < png.width; x+=cellPx){
			//sum the rgb values in 'neighborhood' 
			let count = 0, acc = { r: 0, g: 0, b:0 }
			for(let k = 0; k < cellPx; k++){
				for(let j = 0; j < cellPx; j++ ){
					const i = (png.width*(y+k) + (x+j)) << 2
					if(i > png.data.length) break
					const {r,g,b} = getRGB(png.data,i)
					acc.r += r;
					acc.g += g;
					acc.b += b;
					count++
				}	
			}
			//determine average
			acc.r /= count;
			acc.g /= count;
			acc.b /= count;

			//apply the average values to neighborhood
			for(let k = 0; k < cellPx; k++){
				for(let j = 0; j < cellPx; j++ ){
					const i = (png.width*(y+k) + (x+j)) << 2
					if(i > png.data.length) break
					if(isNaN(acc.r) || isNaN(acc.g) || isNaN(acc.b)) break;
					setRGB(png.data,i,~~acc.r,~~acc.g,~~acc.b)
				}	
			}
		}
	}



}


/**
 * @param {Buffer} bytes 
 */
export const bytesArePNG = (bytes) => (
    bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47 && 
    bytes[4] === 0x0D && bytes[5] === 0x0A && bytes[6] === 0x1A && bytes[7] === 0x0A
)


function getRGB(data,idx){
	const r = data[idx]
	const g = data[idx+1]
	const b = data[idx+2]
	return { r,g,b}
}

function setRGB(data,idx, r,g,b){
	data[idx] = r;
	data[idx+1] = g;
	data[idx+2] = b;
}
