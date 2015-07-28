/*
 * Created by my on 07/07/15.
 */

function journeyMetadata(data, timespan, minSpeed) {
    var i, stext, dd;
    var len = data.length;

    var tempData = [];

    for (i = 0; i < len; i++) {
        if (data[i].speed < minSpeed) {
            data[i].speed = 0;
        }
        tempData.push({
            order: data[i].order,
            speed: data[i].speed,
            timestamp: data[i].timestamp
        });
    }

    if (tempData[0].speed == 0) {
        stext = "waiting";
    } else {
        stext = "moving";
    }

    var tjMetadata = [{
        order: 1,
        type: stext,
        start: 1,
        end: 1,
        stime: tempData[0].timestamp,
        etime: tempData[0].timestamp
    }];

    var j = 1;
    for (i = 1; i < len; i++) {
        if (tempData[i].speed == 0) {
            stext = "waiting";
        } else {
            stext = "moving";
        }

        if (stext == tjMetadata[j - 1].type) {
            tjMetadata[j - 1].end = i + 1;
            tjMetadata[j - 1].etime = tempData[i].timestamp;
        } else {
            tjMetadata.push({
                order: (j + 1),
                type: stext,
                start: (i + 1),
                end: (i + 1),
                stime: tempData[i].timestamp,
                etime: tempData[i].timestamp
            });
            j++;
        }
    }

    len = tjMetadata.length;
    var jMetadata = [{
        order: 1,
        type: tjMetadata[0].type,
        start: tjMetadata[0].start,
        end: tjMetadata[0].end
    }];

    j = 1;
    for (i = 1; i < len; i++) {
        if (tjMetadata[i].type == "waiting") {
            dd = tjMetadata[i].etime - tjMetadata[i].stime;

            if (dd > timespan) {
                jMetadata.push({
                    order: (j + 1),
                    type: tjMetadata[i].type,
                    start: tjMetadata[i].start,
                    end: tjMetadata[i].end
                });
                j++;
            } else {
                jMetadata[jMetadata.length - 1].end = tjMetadata[i].end;

                if ((i + 1) < len) {
                    jMetadata[jMetadata.length - 1].end = tjMetadata[i + 1].end;
                    i++;
                }
            }

        } else {
            jMetadata.push({
                order: (j + 1),
                type: tjMetadata[i].type,
                start: tjMetadata[i].start,
                end: tjMetadata[i].end
            });
            j++;
        }
    }

    return jMetadata;
} //end journeyMetadata

function fXYData(data, istart, iend) {
    var projection = d3.geo.mercator();

    var i, dXY, dLonLat;
    var xyData = [];

    for (i = istart; i < (iend + 1); i++) {
        dLonLat = [+data[i - 1].lon, +data[i - 1].lat];
        dXY = projection(dLonLat);

        xyData.push({
            order: +i,
            X: +dXY[0],
            Y: +dXY[1]
        });
    }

    return xyData;
} //end fXYData

function fLineData(data, simplifiedIndex) {
    var i, ii;
    var len = simplifiedIndex.length;
    var lineData = [];

    for (i = 0; i < len; i++) {
        ii = +simplifiedIndex[i];

        lineData.push([+data[ii - 1].lat, +data[ii - 1].lon]);
    }

    return lineData;
} //end fLineData

function mapShowInit() {
    map = L.map('map').setView([50.96139, -1.42528], 13);

    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        maxZoom: 20,
        id: 'gleng.c0d22786',
        accessToken: 'pk.eyJ1IjoiZ2xlbmciLCJhIjoiYTczMjU0YTlhZTY2YTQyZjYyN2Q1YTZmNzhiZDlhOWQifQ.DPM1q1yqXNGi1FT-sNA9qQ'
    }).addTo(map);

    L.control.scale().addTo(map);
} //end mapShowInit

function mapShow(lineData, jNumber, components, jType) {
    var polyline = L.polyline(lineData, {
        color: 'red',
        weight: 2,
        opacity: .5
    }).addTo(map).bindPopup("Journey " + jNumber);

    components.push(polyline);

    map.fitBounds(polyline.getBounds(), {
        padding: [60, 60]
    });

    var popup = L.popup();

    var label = L.marker(lineData[0]).addTo(map)
        .bindPopup("Journey " + jNumber + "<br />Start").openPopup();

    components.push(label);

    if (jType === "moving") {
        var j = 0;

        var myIcon = L.icon({
            iconUrl: 'images/model-s.png',
            iconSize: [18, 26]
        });

        var marker = L.marker(lineData[0], {
            icon: myIcon,
            opacity: 0.4
        }).addTo(map);

        components.push(marker);


        var timeStep = 5000 / (lineData.length);

        markerMoving();


    }

    function markerMoving() {
        marker.setLatLng(lineData[j]);

        if (++j < lineData.length) {
            setTimeout(markerMoving, timeStep)
        }
    }

    return components;
} //end mapShow
