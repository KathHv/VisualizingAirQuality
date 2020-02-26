# Visualizing Air Quality

## Project Idea
* Visualise the uncertainty associated with data collected from the two official stations
* Plot routes around the two stations for the bike, ride those routes once or more times
* The bike data will show how well the station predicts the measurements surrounding the station
* Part I: Turn this into a scrollytelling story about uncertainty and reliability of stationary air quality measurements: Air quality is in the news and most people never question how it is measured. We can educate them on how the measurements are made and how meaningful they really are.
  * Technology: Website made with HTML, CSS, JavaScript, D3, Leaflet
* Part II: Create an AR application with which people can walk around the station and see the air quality visualized as a "mist" to provide a more playful way of interacting with the data
  * Unity, City Engine, maybe SketchUp

## The Website
* link: https://kathhv.github.io/VisualizingAirQuality

### Tutorial
The scrollytelling website is a comprehensive look into the uncertainties and misrepresentations of air quality measurement. After the preliminary description, the website contains three coloured blocks each with a brief description of an uncertainty chapter. 

The website offers the following functionalities -

* Click on any one of the coloured blocks to skip or move to that specific uncertainty chapter.
* Scrolling down through any chapter will change the visualization on the right and the corresponding text panel on the left. 
* Scrolling back/up reloads the previous visualizations.


### Bugs and Limitations
TODO

## The AR Web Application
* link: https://kathhv.github.io/VisualizingAirQuality/AR

### Tutorial
The AR application is an entirely browser-based app. The app can be accessed from the link above or through the QR code at the end of the scrollytelling website. On initialization, The app gives preliminary description of the air quality measurements and a comparative representation of high and low PM10 values. 

The guide to using the app is as follows -

*	Allow camera and sensor permissions as well as location accessibility.
*	Click the “Next” button at the bottom of the screen 
*	The application displays particles on the screen corresponding to the PM10 value at the user’s location. As the user moves, the location is continuously updated, so are the PM10 values. 
*	The arrow at the bottom of the screen points to the next data point.
*	The panel below the arrow displays the user’s distance from the closest data point. Click on the panel to access Google maps for navigation.
* The gauge on the right displays the PM10 value at the user’s location and the PM10 measurement from the official station at Geist. 
* The top left corner contains the link to the scrollytelling website and the button for choosing a different dataset.

#### It should be noted that the app displays historical data from the mobile sensor and LANUV. The date can be seen on the change dataset button on the top left. 


### Bugs and Limitations
TODO

## References:
* image stickman: https://www.needpix.com/photo/19195/matchstick-man-man-stickman-stick-figure-character-question-helpless-gesture-hands
* image guestion mark: https://pixabay.com/vectors/the-question-mark-sign-question-ask-350170/
