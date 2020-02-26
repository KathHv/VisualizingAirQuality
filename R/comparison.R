library(dplyr) # for glimpse
library(moments)

# read data and omit NAs which will falsify the stastics
bike_1411 = read.csv("./../data/bike_14-11.csv", header = TRUE)
bike_1411 = na.omit(bike_1411)
bike_1912 = read.csv("./../data/bike_19-12_cutted.csv", header = TRUE)
bike_1912 = na.omit(bike_1912)

###### 14.11.
glimpse(bike_1411)

### first and last entries
head(bike_1411)
tail(bike_1411)

### statistics 
min(bike_1411$pm10)
max(bike_1411$pm10)
mean(bike_1411$pm10)
median(bike_1411$pm10)
var(bike_1411$pm10)
sd(bike_1411$pm10)
quantile(bike_1411$pm10, 0.90)
skewness(bike_1411$pm10)

###### 19.12.
glimpse(bike_1912)

### first and last entries
head(bike_1912)
tail(bike_1912)

### statistics
min(bike_1912$pm10)
max(bike_1912$pm10)
mean(bike_1912$pm10)
median(bike_1912$pm10)
var(bike_1912$pm10)
sd(bike_1912$pm10)
quantile(bike_1912$pm10, 0.90)
skewness(bike_1912$pm10)