#read the data
bike_1411= read.csv("./../data/raw/Bike_1Hertz_Messdaten_14.11.csv")
bike_1411_cutted = bike_1411[,c("TIMESTAMP","RECORD","lat","lon","AirTC_Avg","RH_Avg")]

bike_1411_cutted$pm25 = rowSums(bike_1411[,c(38:47)])
bike_1411_cutted$pm10 = rowSums(bike_1411[,c(38:53)])

#renaming and add a id column
names(bike_1411_cutted)[names(bike_1411_cutted) == "RECORD"] = "record"
names(bike_1411_cutted)[names(bike_1411_cutted) == "TIMESTAMP"] = "time"
bike_1411_cutted = cbind(id = 0, bike_1411_cutted)
bike_1411_cutted$id = as.numeric(row.names(bike_1411_cutted))

#save as new csv
write.csv(bike_1411_cutted,"./../data/bike_14-11.csv", row.names = FALSE)

# remove comment to validate pm10 calculataion
#sapply(bike_1411[,c(38:53)], min, na.rm = TRUE)
#sapply(bike_1411[,c(38:53)], max, na.rm = TRUE)

# repeat the same for 1912
bike_1912 = read.csv("./../data/raw/2019-12-19_fasttable.csv")
bike_1912 = bike_1912[,-1]
bike_1912_cutted = bike_1912[,c("TIMESTAMP","RECORD","lat","lon","AirTC_Avg","RH_Avg")]

bike_1912_cutted$pm25 = rowSums(bike_1912[,c(38:47)])
bike_1912_cutted$pm10 = rowSums(bike_1912[,c(38:53)])

names(bike_1912_cutted)[names(bike_1912_cutted) == "RECORD"] = "record"
names(bike_1912_cutted)[names(bike_1912_cutted) == "TIMESTAMP"] = "time"
bike_1912_cutted = cbind(id = 0, bike_1912_cutted)
bike_1912_cutted$id = as.numeric(row.names(bike_1912_cutted))

write.csv(bike_1912_cutted,"./../data/bike_19-12.csv", row.names = FALSE)

# create a subset to remove unused data
bike_1912_cutted = bike_1912_cutted[bike_1912_cutted$record > 64162,]
bike_1912_cutted = bike_1912_cutted[bike_1912_cutted$record < 67002,]

# remove comment to validate pm10 calculataion
#sapply(bike_1912[,c(38:53)], min, na.rm = TRUE)
#sapply(bike_1912[,c(38:53)], max, na.rm = TRUE)

write.csv(bike_1912_cutted,"./../data/bike_19-12_cutted.csv", row.names = FALSE)

