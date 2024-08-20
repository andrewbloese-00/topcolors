# Image Color Utility
- Gets the top n (default 5) most frequent colors appearing in the provided png or jpeg. 


## Usage
1. `npm install`
2. `npm start`
3. send POST requests to the launched server (`/colors`)


## Routes
**POST** `/colors?n=<number?>` 
```json
    "src": "<img_url>"
```

**Response**
```json
    "colors": [
        {
            "r": 255,
            "g": 255,
            "b": 255,
            "frequency": 120
        }, 
    ]
```

* Analyses the image provided by `src` and responds with the top n (default 5) most frequent colors, in ranked order (decreasing) of thier total frequency. 

