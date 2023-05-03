// JavaScript for Tweetgen Block Generator
// Requires jQuery
// BETA-0.5.4 - August 12, 2021

$("#version").html("BETA-0.5.4");

function escapeHtml(text) {
  var map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    // '"': '&quot;',
    // "'": '&#039;' (causes regex issues)
  };

  return text.replace(/[&<>]/g, function (m) {
    return map[m];
  });
}

function addPfpError() {
  $("#pfpError").css("color", "red");
}

function removePfpError() {
  $("#pfpError").css("color", "rgb(109, 117, 125)");
}

// pfp
function handleFiles(files) {
  if (!files.length) {
    return;
  } else if (files[0].type !== "image/jpeg" && files[0].type !== "image/png") {
    addPfpError();
    return;
  } else {
    removePfpError();
    var file = URL.createObjectURL(files[0]);
    $("#pfpOutput").attr("src", file);
  }
}

function resetPfp() {
  $("#pfpInput").val("");
  // $("#pfpURL").val("");
  removePfpError();
  // removePfpUrlError();
  $("#pfpOutput").attr("src", "/c/default-pfp.png");
}

// name
document.getElementById("name").onkeyup = function () {
  var nameMidpoint = document.getElementById("name").value;
  var nameOutput = escapeHtml(nameMidpoint);
  $("#nameOutput").html(nameOutput);

  // if the name takes up more than one line, move it up
  if ($("#nameOutput").parent().height() > 40) {
    $(".namebar").css("padding", "68px 25px 25px 18px");
  } else if ($(".namebar").css("padding") == "68px 25px 25px 18px") {
    $(".namebar").css("padding", "75px 25px 25px 18px");
  }
};

function addUnameError() {
  $("#unameError").css("color", "red");
}

function removeUnameError() {
  $("#unameError").css("color", "rgb(109, 117, 125)");
}

// username
document.getElementById("username").onkeyup = function () {
  if (username.validity.valid === false) {
    addUnameError();
    return;
  } else {
    removeUnameError();
    var usernameOutput = document.getElementById("username").value;
    $(".usernameOutput").html(usernameOutput);
  }
};

// verified
function verifiedUser() {
  if (document.getElementById("verified").checked == true) {
    $("#verifiedOutput").css("display", "inline-block");
  } else {
    $("#verifiedOutput").css("display", "none");
  }
}

// theme
function changeTheme() {
  let v = $("input[type=radio][name=theme]:checked").val();
  if (v == "dim") {
    $("#tweetContainer").attr("theme", "dim");
  } else if (v == "dark") {
    $("#tweetContainer").attr("theme", "dark");
  } else {
    $("#tweetContainer").attr("theme", "light");
  }
}

// font
function changeFont() {
  switch ($("#fontSelect input:checked").val()) {
    case "system":
      $("#tweetContainer").addClass("system-font");
      $("#tweetContainer").removeClass("chirp-font ui");
      return;
    case "inter":
      $("#tweetContainer").addClass("ui");
      $("#tweetContainer").removeClass("chirp-font system-font");
      return;
    default:
      $("#tweetContainer").addClass("chirp-font");
      $("#tweetContainer").removeClass("system-font ui");
      return;
  }
}

function generate() {
  $("#downloadButton").attr("disabled", true);
  $("#downloadButton").html("Please wait...");

  const capture = document.getElementById("tweetContainer");
  const currentHTML = capture.innerHTML;
  var bgColor = $("#tweetContainer").css("background-color");

  html2canvas(capture, {
    allowTaint: true,
    backgroundColor: bgColor,
    windowWidth: 640,
  }).then((canvas) => {
    $("#tweetContainer").html(currentHTML);
    canvas.toBlob((blob) => {
      let src = URL.createObjectURL(blob);
      $("#imageOutput").attr("src", src);
      $("#generatedImageContainer").show();
      $("#downloadButton").attr("disabled", false);
      $("#downloadButton").html(
        '<i class="fas fa-download"></i>  Generate Image'
      );
    }, "image/png");
  });
}
