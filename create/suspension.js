// JavaScript for Tweetgen Suspension Generator
// Requires jQuery
// BETA-0.5.4 - August 12, 2021

$("#version").html("BETA-0.5.4");

var useName = true;

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

function addUnameError() {
  $("#unameError").css("color", "red");
}

function removeUnameError() {
  $("#unameError").css("color", "rgb(109, 117, 125)");
}

function addPfpError() {
  $("#pfpError").show();
}
function removePfpError() {
  $("#pfpError").hide();
}

function resetPfp() {
  $("#pfpInput").attr("files", "");
  removePfpError();
  $("#pfpOutput").attr("src", "/c/default-pfp.png");
}

// toggle: show name/pfp
function toggleName() {
  var v = $("input[type=radio][name=toggleName]:checked").val();
  if (v == "name-yes") {
    $("#optionalFields").show();
    useName = true;
    $("#pfpOutput").show();
    $("#nameOutput").html("Name");
  } else if (v == "name-no") {
    $("#optionalFields").hide();
    useName = false;
    $("#pfpOutput").hide();
    $(".optional-input").val("");
    document.getElementById("verified").checked = false;
    resetPfp();
    verifiedUser();
    handleUsername();
  }
}

// username
function handleUsername() {
  if (username.validity.valid === false) {
    addUnameError();
    return;
  } else {
    removeUnameError();
    var usernameOutput = $("#username").val();
    $("#usernameOutput").html(usernameOutput);
    if (!useName) {
      $("#nameOutput").html("@" + usernameOutput);
    }
  }
}

// pfp
function handlePfpFiles(files) {
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

// name
function handleName() {
  var nameIn = $("#nameInput").val();
  var nameOut = escapeHtml(nameIn);
  $("#nameOutput").html(nameOut);

  // if the name takes up more than one line, move it up
  if ($("#nameOutput").parent().height() > 40) {
    $(".namebar").css("padding", "68px 25px 25px 18px");
  } else if ($(".namebar").css("padding") == "68px 25px 25px 18px") {
    $(".namebar").css("padding", "75px 25px 25px 18px");
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

// verified
function verifiedUser() {
  if (document.getElementById("verified").checked == true) {
    $("#verifiedOutput").css("display", "inline-block");
  } else {
    $("#verifiedOutput").css("display", "none");
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
