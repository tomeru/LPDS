// --------------------------------------------------------------------
// Helpers

if (!String.prototype.supplant) {
    String.prototype.supplant = function (o) {
        return this.replace(/{([^{}]*)}/g,
            function (a, b) {
                var r = o[b];
                return typeof r === 'string' || typeof r === 'number' ? r : a;
            }
        );
    };
}

var shuffle = function(o){
  var j, x, i = o.length;
  while (i) { // same as while(i != 0)
    j = parseInt(Math.random() * i);
    x = o[--i];
    o[i] = o[j];
    o[j] = x;
  };
};


// --------------------------------------------------------------------
// Settings

var subjectGroup1 = [
  [[1,1], [7,2], [3,3], [9,4], [5,5]],
  [[1,2], [7,3], [3,4], [9,5], [5,6]],
  [[1,3], [7,4], [3,5], [9,6], [5,1]],
  [[1,4], [7,5], [8,6], [9,1], [5,2]],
  [[1,5], [7,6], [8,1], [9,2], [5,3]],
  [[1,6], [7,1], [8,2], [9,3], [5,4]]];

var subjectGroup2 = [
  [[6,1], [2,2], [8,3], [4,4], [10,5]],
  [[6,2], [2,3], [8,4], [4,5], [10,6]],
  [[6,3], [2,4], [8,5], [4,6], [10,1]],
  [[6,4], [2,5], [3,6], [4,1], [10,2]],
  [[6,5], [2,6], [3,1], [4,2], [10,3]],
  [[6,6], [2,1], [3,2], [4,3], [10,4]]];

var subjectGroups = [subjectGroup1, subjectGroup2];
var mySubjectGroup = random(0, 1);
var myVideoRow = random(0, 5);
var myVideoOrder = subjectGroups[mySubjectGroup][myVideoRow];
shuffle(myVideoOrder);
showSlide("instructions");


// --------------------------------------------------------------------
// Main

var showVideo = function(world, curVideo){
  var data = { world : world, id : curVideo };
  var videoFile = "movies/world{world}/world{world}_{id}.flv".supplant(data);
  var imageFile = "movies/world{world}/world{world}_{id}last.jpg".supplant(data);
  jwplayer("video-container").setup(
    { flashplayer: "jwplayer/player.swf",
      file: videoFile,
      image: imageFile
      // ,events: {
      //   onIdle : function(e){alert("idle state")},
      //   onPlay : function(e){alert("play state")}
      // }
    });

};

function showSlide(id) {
  $(".slide").hide();
  $("#"+id).show();
}

function random(a,b) {
	if (typeof b == "undefined") {
		a = a || 2;
		return Math.floor(Math.random()*a);
	} else {
		return Math.floor(Math.random()*(b-a+1)) + a;
	}
}

Array.prototype.random = function() {
  return this[random(this.length)];
}

var experiment = {

  globalComprehension : "",
  index : 0,
  videoRow : myVideoRow,
  videoOrder : myVideoOrder,
  subjectGroup : mySubjectGroup,
  curVideo : "",
  curWorld : "",
  feedbackReasoning : "",
  feedbackDifficulty : "",

  data: [],

  play : function(){
    showVideo(experiment.curWorld, experiment.curVideo);
  },

  start: function(){
    experiment.globalComprehension = $("#comprehension_1").val();
    return experiment.next();
  },

  storeFeedback: function(){
    var feedbackReasoning = $("#feedback_reasoning").val();
    var feedbackDifficulty = $('input:radio[name="feedback_difficulty"]:checked').val();
    if ((feedbackReasoning == "") || (typeof feedbackDifficulty == "undefined")) {
      alert("Please fill out the questions.");
      return false;
    } else {
      experiment.feedbackDifficulty = feedbackDifficulty;
      experiment.feedbackReasoning = feedbackReasoning;
      return experiment.end();
    };
  },

  feedback: function() {
    showSlide("feedback");
  },

  end: function() {
    showSlide("finished");
    setTimeout(function() { turk.submit(experiment) }, 1500);
  },

  submitAndNext : function() {
    if (_.any($("select"), function(s){return $(s).val()=="unselected"})){
      alert("Please fill out all form fields.");
      return false;
    } else {
      var data = {
        index : experiment.index,
        curVideo : experiment.curVideo,
        curWorld : experiment.curWorld
      };
      $.each($("select"), function(i,s){data[$(s).attr("id")] = $(s).val()});
      experiment.data.push(data);

      return experiment.next();
    };
  },

  next: function() {

    var curWorldAndVideo = experiment.videoOrder.shift();
    experiment.index = experiment.index + 1;

    if (typeof curWorldAndVideo == "undefined") {
      return experiment.feedback();
    }

    experiment.curWorld = curWorldAndVideo[0];
    experiment.curVideo = curWorldAndVideo[1];

    showSlide("stage");

    // Reset all select boxes
    $("select").val("unselected");

    // Display the video stimulus.
    experiment.play();

    // Update the progress bar
    $("#indicator-stage").width((120 + experiment.index*50) + "px");

    $('html, body').animate({ scrollTop: 0 }, 0);

  }
};

var submitStorySlide = function(){
  if ($("#comprehension_1").val() == "") {
    alert("Please fill out the question.");
    return false;
  } else {
    return experiment.start();
  };
}