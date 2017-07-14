/* Magic Mirror
 * Module: MMM-MARS
 *
 * By Mykle1
 *
 */
Module.register("MMM-MARS", {

    // Module config defaults.
    defaults: {
        useHeader: true,                 // False if you don't want a header      
        header: "",                      // Change in config file. useHeader must be true
        maxWidth: "300px",
        animationSpeed: 3000,            // fade speed
        initialLoadDelay: 3250,
        retryDelay: 2500,
        rotateInterval: 5 * 60 * 1000,   // 5 minutes
        updateInterval: 30 * 60 * 1000,  // NASA limitation = 50 calls per day. Do NOT change!

    },

    getStyles: function() {
        return ["MMM-MARS.css"];
    },

    start: function() {
        Log.info("Starting module: " + this.name);

        requiresVersion: "2.1.0",

        //  Set locale.
        this.url = "https://api.nasa.gov/mars-photos/api/v1/rovers/curiosity/photos?sol=1&api_key=DEMO_KEY";
        this.MARS = [];
        this.activeItem = 0;
        this.rotateInterval = null;
        this.scheduleUpdate();
    },

    getDom: function() {

        var wrapper = document.createElement("div");
        wrapper.className = "wrapper";
        wrapper.style.maxWidth = this.config.maxWidth;

        if (!this.loaded) {
            wrapper.innerHTML = "Give the people the air . . .";
            wrapper.classList.add("bright", "light", "small");
            return wrapper;
        }

        if (this.config.useHeader != false) {
            var header = document.createElement("header");
            header.classList.add("xsmall", "bright", "header");
            header.innerHTML = this.config.header;
            wrapper.appendChild(header);
        }
		
		
	//	Rotating my data
		var MARS = this.MARS;
		var MARSKeys = Object.keys(this.MARS);
        if (MARSKeys.length > 0) {
            if (this.activeItem >= MARSKeys.length) {
                this.activeItem = 0;
            }
            var MARS = this.MARS[MARSKeys[this.activeItem]];
		
		console.log(MARS);

        var top = document.createElement("div");
        top.classList.add("list-row");
		
		
		// picture
		var img = document.createElement("img");
		img.classList.add("photo");
		img.src = MARS.img_src;
		wrapper.appendChild(img);
		
		
		// earth picDate
        var picDate = document.createElement("div");
        picDate.classList.add("small", "bright", "picDate");
        picDate.innerHTML = "Earth Date " + MARS.earth_date;
        wrapper.appendChild(picDate);
		
		
		// mars sol date
        var solDate = document.createElement("div");
        solDate.classList.add("small", "bright", "solDate");
        solDate.innerHTML = "Mars Sol Date " + MARS.sol;
        wrapper.appendChild(solDate);
		
		
        // camera
        var camera = document.createElement("div");
        camera.classList.add("small", "bright", "camera");
        camera.innerHTML = MARS.camera.full_name;
        wrapper.appendChild(camera);
		
		
		
		// rover name
        var rover = document.createElement("div");
        rover.classList.add("small", "bright", "rover");
        rover.innerHTML = "Rover " + MARS.rover.name;
        wrapper.appendChild(rover);
		
		
		// launch from earth date
        var launch = document.createElement("div");
        launch.classList.add("small", "bright", "launch");
        launch.innerHTML = "Launched from Earth " + MARS.rover.launch_date;
        wrapper.appendChild(launch);
		
		
		
		
		// landed on mars date
        var landed = document.createElement("div");
        landed.classList.add("small", "bright", "landed");
        landed.innerHTML = "Landed on Mars " + MARS.rover.landing_date;
        wrapper.appendChild(landed);
		
		
		// missionStatus and length
        var missionStatus = document.createElement("div");
        missionStatus.classList.add("small", "bright", "missionStatus");
        missionStatus.innerHTML = "Mission Status is " + MARS.rover.status + " , " + MARS.rover.max_sol + " sols";
        wrapper.appendChild(missionStatus);
		
		
		// total photos taken
        var totalPhotos = document.createElement("div");
        totalPhotos.classList.add("small", "bright", "totalPhotos");
        totalPhotos.innerHTML = MARS.rover.total_photos + " photos taken to date";
        wrapper.appendChild(totalPhotos);
		
		}
        return wrapper;
    },


    processMARS: function(data) {
        this.today = data.Today;
        this.MARS = data; // Object containing an array that contains objects
        this.loaded = true;
    },

    scheduleCarousel: function() {
        console.log("Carousel of MARS fucktion!");
        this.rotateInterval = setInterval(() => {
            this.activeItem++;
            this.updateDom(this.config.animationSpeed);
        }, this.config.rotateInterval);
    },

    scheduleUpdate: function() {
        setInterval(() => {
            this.getMARS();
        }, this.config.updateInterval);
        this.getMARS(this.config.initialLoadDelay);
    },

    getMARS: function() {
        this.sendSocketNotification('GET_MARS', this.url);
    },

    socketNotificationReceived: function(notification, payload) {
        if (notification === "MARS_RESULT") {
            this.processMARS(payload);
            if (this.rotateInterval == null) {
                this.scheduleCarousel();
            }
            this.updateDom(this.config.animationSpeed);
        }
        this.updateDom(this.config.initialLoadDelay);
    },
});