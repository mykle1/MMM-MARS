/* Magic Mirror
 * Module: MMM-MARS
 *
 * By Mykle1
 *
 */
Module.register("MMM-MARS", {

    // Module config defaults.           // Make all changes in your config.js file
    defaults: {
        rover: "curiosity", // which rover? curiosity, opportunity, spirit
        solDate: "200", // sol date you want pictures from
        scroll: "no", // yes or no
        useHeader: true, // false if you don't want a header
        header: "", // Change in config file. useHeader must be true
        maxWidth: "300px", // size the module
        animationSpeed: 3000, // fade speed
        initialLoadDelay: 3250,
        retryDelay: 2500,
        rotateInterval: 5 * 60 * 1000, // 5 minutes
        updateInterval: 60 * 60 * 1000, // NASA limitation = 50 calls per day. Do NOT change!

    },

    getStyles: function() {
        return ["MMM-MARS.css"];
    },

    start: function() {
        Log.info("Starting module: " + this.name);

        requiresVersion: "2.1.0",

            //  Set locale.
        this.url = "https://api.nasa.gov/mars-photos/api/v1/rovers/" + this.config.rover + "/photos?sol=" + this.config.solDate + "&api_key=DEMO_KEY";
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

            //	console.log(MARS); // for checking

            // config options
            var rover = this.config.rover;
            var sol = this.config.solDate;

            var top = document.createElement("div");
            top.classList.add("list-row");

            // picture
            var img = document.createElement("img");
            img.classList.add("photo");
            img.src = MARS.img_src;
            wrapper.appendChild(img);


            // scrolling or static information
            if (this.config.scroll == "no") {


                // earth picDate
                var picDate = document.createElement("div");
                picDate.classList.add("xsmall", "bright", "picDate");
                picDate.innerHTML = "Earth Date " + MARS.earth_date;
                wrapper.appendChild(picDate);


                // mars sol date
                var solDate = document.createElement("div");
                solDate.classList.add("xsmall", "bright", "solDate");
                solDate.innerHTML = "Mars Sol Date " + MARS.sol;
                wrapper.appendChild(solDate);


                // rover name
                var roverName = document.createElement("div");
                roverName.classList.add("small", "bright", "roverName");
                roverName.innerHTML = "Rover " + MARS.rover.name;
                wrapper.appendChild(roverName);


                // camera
                var camera = document.createElement("div");
                camera.classList.add("xsmall", "bright", "camera");
                camera.innerHTML = MARS.camera.full_name;
                wrapper.appendChild(camera);


                // launch from earth date
                var launch = document.createElement("div");
                launch.classList.add("xsmall", "bright", "launch");
                launch.innerHTML = "Launched from Earth " + MARS.rover.launch_date;
                wrapper.appendChild(launch);


                // landed on mars date
                var landed = document.createElement("div");
                landed.classList.add("xsmall", "bright", "landed");
                landed.innerHTML = "Landed on Mars " + MARS.rover.landing_date;
                wrapper.appendChild(landed);


                // missionStatus and length
                var missionStatus = document.createElement("div");
                missionStatus.classList.add("xsmall", "bright", "missionStatus");
                missionStatus.innerHTML = "Mission Status is " + MARS.rover.status + " , " + MARS.rover.max_sol + " sols";
                wrapper.appendChild(missionStatus);


                // total photos taken
                var totalPhotos = document.createElement("div");
                totalPhotos.classList.add("xsmall", "bright", "totalPhotos");
                totalPhotos.innerHTML = MARS.rover.total_photos + " photos taken to date";
                wrapper.appendChild(totalPhotos);

            } else if (this.config.scroll == "yes") {
                var marsDes = document.createElement("div");
                marsDes.classList.add("small", "bright", "marsDes");
                marsDes.innerHTML = '<marquee behavior="scroll" direction ="left" scrollamount="3">' +
                    "Earth Date " + MARS.earth_date + " &nbsp &nbsp " +
                    "Mars Sol Date " + MARS.sol + " &nbsp &nbsp " +
                    "Rover " + MARS.rover.name + " &nbsp &nbsp " +
                    MARS.camera.full_name + " &nbsp &nbsp " +
                    "Launched from Earth " + MARS.rover.launch_date + " &nbsp &nbsp " +
                    "Landed on Mars " + MARS.rover.landing_date + " &nbsp &nbsp " +
                    "Mission Status is " + MARS.rover.status + " , " + MARS.rover.max_sol + " sols" + " &nbsp &nbsp " +
                    MARS.rover.total_photos + " photos taken to date" + " &nbsp &nbsp " +
                    '</marquee>';
                wrapper.appendChild(marsDes);
            }

        }
        return wrapper;
    },


    notificationReceived: function(notification, payload) {
        if (notification === 'HIDE_MARS') {
            this.hide(1000);
        } else if (notification === 'SHOW_MARS') {
            this.show(1000);
        }

    },


    processMARS: function(data) {
        this.today = data.Today;
        this.MARS = data;
        //        console.log(this.MARS); // for checking
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
