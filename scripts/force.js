var body = document.body,
    html = document.documentElement,
    episodes = [
      'I',
      'II',
      'III',
      'IV',
      'V',
      'VI'
    ],
    pageTitle = $('#title').text();



var height = html.clientHeight,
    width = body.scrollWidth;
// alert(html.clientHeight);

var w = width,
    h = height,
    fill = d3.scale.category20(),
    palette = [
      '#000',
      '#2babd6',
      '#472bd6',
      '#ffad33',
      '#ff3333',
    ],
    filter = 'all';

var vis = d3.select("#chart")
  .append("svg:svg")
    .attr("width", w)
    .attr("height", h);

d3.json("json.php", function(json) {
  var force = d3.layout.force()
      .charge(-150)
      .linkDistance(75)
      .nodes(json.nodes)
      .links(json.links)
      .size([w, h])
      .start();

    // dropshadow start

    var defs = vis.append("defs");
    var filter = defs.append("filter")
        .attr('id','drop-shadow')
        .attr("height", "200%")
        .attr("width", "200%")
        .attr("x", "0")
        .attr("y", "0");


    // translate output of Gaussian blur to the right and downwards with 2px
    // store result in offsetBlur
    filter.append("feOffset")
      .attr("result", "offOut")
        .attr("in", "sourceGraphic")
        .attr("dx", 20)
        .attr("dy", 20);

    // SourceAlpha refers to opacity of graphic that this filter will be applied to
    // convolve that with a Gaussian with standard deviation 3 and store result
    // in blur
    filter.append("feGaussianBlur")
        .attr("result", "blurOut")
        .attr("in", "offOut")
        .attr("stdDeviation", 10);
    
    // overlay original SourceGraphic over translated blurred opacity by using
    // feMerge filter. Order of specifying inputs is important!
    filter.append("feBlend")
      .attr('in','SourceGraphic')
      .attr('in2','blurOut')
      .attr('mode','normal');

    // feMerge.append("feMergeNode")
    //     .attr("in", "offsetBlur")
    // feMerge.append("feMergeNode")
    //     .attr("in", "SourceGraphic");

        // dropshadow end


        //Create an array logging what is connected to what
        var linkedByIndex = {};
        for (i = 0; i < json.nodes.length; i++) {
            linkedByIndex[i + "," + i] = 1;
        };
        json.links.forEach(function (d) {
            linkedByIndex[d.source.index + "," + d.target.index] = 1;
        });
        //This function looks up whether a pair are neighbours
        function neighboring(a, b) {
            return linkedByIndex[a.index + "," + b.index];
        }
        function connectedNodes(target,n) {
            if (n == 1) {
                //Reduce the opacity of all but the neighbouring nodes
                d = d3.select(target).node().__data__;
                node.style("opacity", function (o) {
                    return neighboring(d, o) | neighboring(o, d) ? 0.9 : 0.25;
                });
                link.style("opacity", function (o) {
                    return d.index==o.source.index | d.index==o.target.index ? 0.9 : 0.25;
                });
            } else {
                //Put them back to opacity=1
                node.style("opacity", 0.7);
                link.style("opacity", 0.7);
            }
        }

  var link = vis.selectAll("line.link")
      .data(json.links)
      .enter().append("svg:line")
      .attr("class", "link")
      // .style("stroke-width", function(d) { return Math.sqrt(d.value); })
      .style("stroke-width", 1)
      .style("stroke-opacity", 0.675 )
      .attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; })
      .style("marker-end",  "url(#source)") // Modified line ;


  // //Set up tooltip
  // var tip = d3.tip()
  //     .attr('class', 'd3-tip')
  //     .offset([-10, 0])
  //     .html(function (d) {
  //     return  d.name + "";
  // })
  // vis.call(tip);


  var node = vis.selectAll("circle.node")
      .data(json.nodes)
      .enter().append("svg:circle")
      .attr("class", "node")
      .attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; })
      .attr("r", function(d) { return (d.playcount * 5) + 5; })
      .attr("title", function(d) { return d.name; })
      .attr("value", function(d) { return d.value; })
      .attr("subtitle", function(d) { return d.playcount; })
      .attr("group", function(d) { return d.group; })
      // .style("filter", "url(#drop-shadow)")            

      // .style("fill", palette'#f00')
      .style("fill", function(d) { return palette[d.affinity]; })
      // .style("fill", '#f00' )
      // .style("fill-opacity", function(d) { return 0.5 + (0.1 * d.playcount)  ; })
      .style("opacity", 0.675 )
      // .style("fill", function(d) { return fill(d.group); })
      .on("mouseover", mouseover)
      .on("mouseout", mouseout)
      
      .call(force.drag); //Added code 
    
    // node.each(collide(0.5)); //Added 
      

  node.append("svg:title")
      .text(function(d) { return d.name; });

  vis.style("opacity", 1e-6)
    .transition()
      .duration(1000)
      .style("opacity", 1);

  force.on("tick", function() {
    link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    node.attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });
  });

  

  function mouseover() {
    
    var suffix = '', name = d3.select(this).attr('title');
    var kills = d3.select(this).attr('subtitle');
    // alert(name);
    // if (kills > 0) suffix = ' ('+kills+')';
    if (kills > 0) suffix = '';
    // var el = document.getElementById("title").textContent = name + suffix;
    $('#title').text(name + suffix);
    connectedNodes(this,1);
    var ep = $(this).attr('value').split(',');
    for(i = 0; i < ep.length; i++) {
      var tmpEp = ep[i]-1;
      $('.ep-switch li:eq('+tmpEp+')').addClass('active-char');
    }



  }

  function mouseout() {
    // var el = document.getElementById("title").textContent = '';
    $('#title').text(pageTitle);
    connectedNodes(this,0);
    $('.ep-switch li').removeClass('active-char');
  }
});


jQuery(function($){
  $('body').prepend('<ul class="ep-switch"></ul>');

  for (var i = 0; i < episodes.length; i++){
    var index = (i + 1);
    $('.ep-switch').append('<li><a href="#" data-episode="' + index + '">' + episodes[i]  + '</a></li>');
  }
  $('.ep-switch').append('<li class="active"><a href="#" data-episode="all">All</a></li>');

  var q = 0;
  $('.ep-switch').on('mouseover','a',function(e) {
    e.preventDefault();
    var episode = $(this).data('episode');
    var text = $(this).text();
    $(this).parent('li').addClass('active').siblings('li').removeClass('active');
    if (episode == 'all') {
      // $('#title').text('ALL EPISODES');
      $('circle').css('opacity',0.675);
    } else {
      $('#title').text('EPISODE ' + text);
      $('circle').css('opacity',0.675).filter(':not([group*="' + episode + '"])').css('opacity',0.0625);  
    }
    $('line').css('opacity',0.0625);
    // alert(episode);
  }).on('mouseout','a',function(e) {
    $('#title').text(pageTitle);
    $('circle').css('opacity',0.675);
    $('line').css('opacity',0.675);
    $(this).parent('li').removeClass('active').siblings('li:last').addClass('active');
  }).on('click','a',function(e) {
    e.preventDefault();
  });
});