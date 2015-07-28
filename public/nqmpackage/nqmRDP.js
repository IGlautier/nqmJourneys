/*
 * Created by Gavin Leng on 29/06/2015.
 */

NqmRDP = (function() {

    //constructor
    function NqmRDP() {
        RdpInterface.call(this);

        this._dataWork = [];
        this._pBegin = 0;
        this._pEnd = 0;
        this._pPoint = 0;
        this._ee = 0;
        this._dataTemp = [];
        this._fData = [];
        this._sData = [];
    } //end NqmRDP

    NqmRDP.prototype = Object.create(RdpInterface.prototype);
    NqmRDP.prototype.constructor = NqmRDP;

    NqmRDP.prototype.initRDP = function(d, xkey, ykey, epsilon) {
        var tdataWork = [];
        for (var i = 0, len = d.length; i < len; i++) {
            tdataWork.push({
                order: +d[i].order,
                x: +d[i][xkey],
                y: +d[i][ykey],
                flag: 0
            });
        }

        this._dataWork = tdataWork;

        this._dataTemp = this._dataWork.slice(0);

        this._ee = epsilon;
    }; //end initRDP

    NqmRDP.prototype.nqmRDP = function() {
        if (this._ee < 0) {
            this._dataTemp.forEach(function(d) {
                d.flag = -2;
            });

            return this._dataTemp;
        }

        var i, dd, pindex;
        var dmax = 0;
        var len = this._dataTemp.length;

        this._pBegin = this._dataTemp[0];
        this._pEnd = this._dataTemp[len - 1];

        this._pBegin.flag = 1;
        this._pEnd.flag = 1;

        //find the maximum distance
        for (i = 1; i < len - 1; i++) {
            this._pPoint = this._dataTemp[i];

            dd = dPointToLine(this._pBegin, this._pEnd, this._pPoint);

            if (dd > dmax) {
                pindex = i;
                dmax = dd;
            }
        }

        if (dmax > this._ee) {
            this._dataTemp[pindex].flag = 1;
            this._dataTemp = this._dataTemp.slice(0, pindex + 1);

            if (this._dataTemp.length < 3) {
                pindex = this._dataWork.map(function(e) {
                    return e.flag
                }).indexOf(0) - 1;

                if (pindex < 0) {
                    this._sData = finalDataCall.call(this);
                } else {
                    this._dataTemp = this._dataWork.slice(pindex);
                    pindex = this._dataTemp.map(function(e) {
                        return e.flag
                    }).indexOf(1, 1);
                    this._dataTemp = this._dataTemp.slice(0, pindex + 1);
                    NqmRDP.prototype.nqmRDP.call(this);
                }
            } else {
                NqmRDP.prototype.nqmRDP.call(this);
            }
        } else {
            for (i = 1; i < len - 1; i++) {
                this._dataTemp[i].flag = -1;
            }

            pindex = this._dataWork.map(function(e) {
                return e.flag
            }).indexOf(0) - 1;

            if (pindex < 0) {
                this._sData = finalDataCall.call(this);
            } else {
                this._dataTemp = this._dataWork.slice(pindex);
                pindex = this._dataTemp.map(function(e) {
                    return e.flag
                }).indexOf(1, 1);
                this._dataTemp = this._dataTemp.slice(0, pindex + 1);
                NqmRDP.prototype.nqmRDP.call(this);
            }
        }

        if ((this._sData.length == 2) && (this._sData[0].x == this._sData[1].x) && (this._sData[0].x == this._sData[1].x)) {
            this._sData.pop();
        }

        return this._sData;
    }; //end nqmRDP

    function dPointToLine(pBegin, pEnd, pPoint) {
        this._pBegin = pBegin;
        this._pEnd = pEnd;
        this._pPoint = pPoint;

        if ((this._pEnd.x == this._pBegin.x) && (this._pEnd.y == this._pBegin.y)) {
            return Math.sqrt(Math.pow((this._pPoint.x - this._pBegin.x), 2) + Math.pow((this._pPoint.y - this._pBegin.y), 2));
        } else if (this._pEnd.x == this._pBegin.x) {
            if (this._pPoint.x == this._pBegin.x) {
                return Math.abs(this._pPoint.y - this._pBegin.y);
            } else {
                return Math.abs(this._pPoint.x - this._pBegin.x);
            }
        } else if (this._pEnd.y == this._pBegin.y) {
            if (this._pPoint.y == this._pBegin.y) {
                return Math.abs(this._pPoint.x - this._pBegin.x);
            } else {
                return Math.abs(this._pPoint.y - this._pBegin.y);
            }
        } else {
            var slope = (this._pEnd.y - this._pBegin.y) / (this._pEnd.x - this._pBegin.x);
            var intercept = this._pBegin.y - (slope * this._pBegin.x);

            return Math.abs(slope * this._pPoint.x - this._pPoint.y + intercept) / Math.sqrt(Math.pow(slope, 2) + 1);
        }

    } //end dPointToLine

    function finalDataCall() {
        var len = this._dataWork.length;

        for (var i = 0; i < len; i++) {
            if (this._dataWork[i].flag == 1) {
                this._fData.push(this._dataWork[i]);
            }
        }

        return this._fData;
    } //end finalDataCall

    NqmRDP.prototype.rdpDraw = function() {
        var margin = {
            top: 20,
            right: 20,
            bottom: 30,
            left: 50
        };
        var width = 960 - margin.left - margin.right;
        var height = 500 - margin.top - margin.bottom;

        var svg = d3.select("body").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var x = d3.scale.linear()
            .range([0, width]);

        var y = d3.scale.linear()
            .range([height, 0]);

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom");

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left");

        var line = d3.svg.line()
            .x(function(d) {
                return x(+d.x);
            })
            .y(function(d) {
                return y(+d.y);
            });

        x.domain(d3.extent(this._dataWork, function(d) {
            return +d.x;
        }));
        y.domain(d3.extent(this._dataWork, function(d) {
            return +d.y;
        }));

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis)
            .append("text")
            .attr("x", width)
            .attr("dy", "-.71em")
            .style("text-anchor", "end")
            .text("X");

        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .append("text")
            .attr("x", 6)
            .attr("dy", "-.48em")
            .style("text-anchor", "end")
            .text("Y");

        svg.append("path")
            .attr("class", "line")
            .attr("d", line(this._dataWork))
            .attr("stroke", "blue");

        svg.append("path")
            .attr("class", "line")
            .transition()
            .delay(1000)
            .attr("d", line(this._fData))
            .attr("stroke", "red");
    }; //end rdpDraw


    return NqmRDP;
}()); //End NqmRDP
