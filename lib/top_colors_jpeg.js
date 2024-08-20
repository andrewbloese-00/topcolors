import fs from 'fs'
import jpeg from 'jpeg-js'
import { MaxHeap } from './heap.js';



export async function loadJPEG(path){
    try {
        const jpegBytes = await fs.promises.readFile(path);
        const jpegData = jpeg.decode(jpegBytes, { useTArray: true });
        return { jpeg: jpegData };

    } catch (error) {
        console.error("[loadJPEG] Failed: ", error );
        return { error };
    }
}


export function getTopNColorsJPEG(jpeg,n=3){
    //pixelate to reduce variation
    pixelate(jpeg,50)

    const freq = {}
    for(let y = 0; y < jpeg.height; y++){
        for(let x = 0; x < jpeg.width; x++){
            const i = (jpeg.width*y+x) << 2
            const r = jpeg.data[i]
            const g = jpeg.data[i+1]
            const b = jpeg.data[i+2]

            // if(r+g+b < threshold) continue

            const key = `${r},${g},${b}`
            if(!freq[key]) freq[key] = 1
            else freq[key]++
        }
    }


    const heap = new MaxHeap((a,b)=> a[1]-b[1])
    let totalCount = 0
    for(const rgb in freq){
        heap.insert([rgb,freq[rgb]])
        totalCount++;
    }
    let sz = heap.size
    const results = [] 
    for(let i = 0; i < Math.min(sz,n); i++){
        const {value:[rgb,freqency], error} = heap.extract()
        if(error){
            console.error("Heap extract failed...");
            break;
        }


        const [r,g,b] = rgb.split(",").map(Number)
        results.push({r,g,b,freqency})
    }
    return results
}





export const pixelate = (jpeg,cellPx=5) => {
	for(let y = 0; y < jpeg.height; y+=cellPx){
		for(let x = 0; x < jpeg.width; x+=cellPx){
			//sum the rgb values in 'neighborhood' 
			let count = 0, acc = { r: 0, g: 0, b:0 }
			for(let k = 0; k < cellPx; k++){
				for(let j = 0; j < cellPx; j++ ){
					const i = (jpeg.width*(y+k) + (x+j)) << 2
					if(i > jpeg.data.length) break
					const {r,g,b} = getRGB(jpeg.data,i)
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
					const i = (jpeg.width*(y+k) + (x+j)) << 2
					if(i > jpeg.data.length) break
					if(isNaN(acc.r) || isNaN(acc.g) || isNaN(acc.b)) break;
					setRGB(jpeg.data,i,~~acc.r,~~acc.g,~~acc.b)
				}	
			}
		}
	}



}


/**
 * @param {Buffer} bytes 
 */
export const bytesAreJPEG = (bytes) => bytes[0] === 0xFF && bytes[1] === 0xD8




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