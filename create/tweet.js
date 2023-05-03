// JavaScript for Tweetgen Tweet Generator
// Requires jQuery
// BETA-0.5.4 - August 12, 2021

const maxCharsQuery = /(\?|&)maxChars=([0-9]+)/i.exec(document.URL); // This implements changing the max character count via the URL. e.g. /tweet.html?maxChars=140
const maxChars = maxCharsQuery ? Number(maxCharsQuery[2]) : 280;
var editable = false;
var unloadPrompt = false;
var debunk = false;
var useTwemoji = true;
const unameRegex = /^@?[A-Za-z0-9_]+$/;
var interactions = { retweets: 0, quotes: 0, likes: 0 };
var modals = {
  pfp: new bootstrap.Modal(document.getElementById("pfpModal")),
  img: new bootstrap.Modal(document.getElementById("imgModal")),
  date: new bootstrap.Modal(document.getElementById("dateModal")),
};

// Raw inputs vs Twemoji-parsed inputs
var tweetRaw = "";
var tweetParsed = "";

function abbrNumber(str) {
  var n = Number(str);
  if (n < 1e3) return n;
  else if (n >= 1e3 && n < 1e6) return +(n / 1e3).toFixed(1) + "K";
  else if (n >= 1e6 && n < 1e9) return +(n / 1e6).toFixed(1) + "M";
  else if (n >= 1e9 && n < 1e12) return +(n / 1e9).toFixed(1) + "B";
  else return str;
}

function ampmTime(time) {
  let ampm;
  let hr;

  let splitTime = time.split(":");
  let hrIn = Number(splitTime[0]);
  let min = splitTime[1];

  if (hrIn >= 12) {
    ampm = "PM";
  } else {
    ampm = "AM";
  }

  // convert 24 hr time to 12 hr time
  if (hrIn == 0) {
    hr = 12;
  } else if (hrIn >= 13) {
    hr = hrIn - 12;
  } else {
    hr = hrIn - 0;
  }

  return hr + ":" + min + " " + ampm;
}

function parseTime(num) {
  // Converts, for example, 7 to "07" to use as a time value.
  let result;
  if (num < 10) {
    result = "0" + num;
  } else {
    result = String(num);
  }
  return result;
}

function emptyDivs(element) {
  // Fixes an issue where empty lines count as 2 line breaks when it's only 1
  return element.innerHTML.replace(/<div><br><\/div>/g, "<br>");
}

function resetText(element) {
  // Resets editable text so that they overflow in the right direction
  var content = $(element).html();
  $(element).html("");
  void element.offsetHeight; // Doing this will make the browser re-render the element
  $(element).html(content);
}

function queryModal(name) {
  if (!editable) return;
  modals[name].show();
}

function toggleEditing() {
  if (editable) {
    if ($("#client").hasClass("placeholder")) $("#clientDisplay").hide();
    $("#numbersInfo").hide();
    tweetRaw = $("#tweetContainer").html();
    $(".editable").attr("contenteditable", false);
    $("#tweetContainer").attr("editing", "off");
    editable = false;

    // Hiding retweets/quotes/likes if they are 0
    let total = 0;
    for (let ix in interactions) {
      let val = interactions[ix];
      if (val === 0) $(`#${ix}Display`).hide();
      else total++;
    }
    if (total === 0) $("#tweetNumbers").hide();

    $("#previewButton").html('<i class="fas fa-edit"></i>  Edit image');
    if (useTwemoji)
      twemoji.parse(document.getElementById("tweetContainer"), {
        base: "/c/twemoji/assets/",
      });
    tweetParsed = $("#tweetContainer").html();
  } else {
    if (tweetRaw && tweetParsed) $("#tweetContainer").html(tweetRaw);
    $(".editable").attr("contenteditable", true);
    $(".editable").attr("spellcheck", "true");
    $("#tweetContainer").attr("editing", "on");
    editable = true;
    $("#previewButton").html('<i class="fas fa-eye"></i>  Preview image');
    $(".tweetNumber").show();
    $("#tweetNumbers").show();
    $("#numbersInfo").show();
    $("#clientDisplay").show();
  }
}

function changeTheme() {
  switch ($("#themeSelect input:checked").val()) {
    case "themeDim":
      $("#tweetContainer").attr("theme", "dim");
      return;
    case "themeDark":
      $("#tweetContainer").attr("theme", "dark");
      return;
    case "themeLight":
      $("#tweetContainer").attr("theme", "light");
      return;
  }
}

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

function changeEmoji() {
  switch ($("#emojiSelect input:checked").val()) {
    case "system":
      useTwemoji = false;
      toggleEditing();
      toggleEditing();
      break;
    default:
      useTwemoji = true;
      toggleEditing();
      toggleEditing();
      break;
  }
}

function resetPfp() {
  $("#pfpFiles").val("");
  $("#pfp").attr("src", "/c/default-pfp.png");
}

function updatePfp() {
  let file = document.getElementById("pfpFiles").files[0];
  if (file) {
    let fileBlob = URL.createObjectURL(file);
    $("#pfp").attr("src", fileBlob);
  } else {
    $("#pfp").attr("src", "/c/default-pfp.png");
  }
}

function toggleVerified() {
  $("#verified").toggle();
}

function checkName(element, end) {
  let length = element.textContent.length;

  if (length > 50) {
    $("#nameInfo").html(
      `<span style="color:red">${length}</span>/50 characters`
    );
  } else {
    $("#nameInfo").html(`${length}/50 characters`);
  }

  if (end) {
    $("#nameInfo").hide();
    resetText(element);
  } else {
    $("#nameInfo").show();
  }
}

function checkUsername(element, end) {
  let hasAt = element.textContent.startsWith("@");
  let length = hasAt
    ? element.textContent.length - 1
    : element.textContent.length;
  let info = "";

  if (length > 15) {
    info = `<span style="color:red">${length}</span>/15 characters.`;
  } else {
    info = `${length}/15 characters.`;
  }

  if (unameRegex.test(element.textContent)) {
    info += " Should only be numbers, letters, and _ characters.";
  } else {
    info +=
      ' <span style="color:red">Should only be numbers, letters, and _ characters.</span>';
  }

  if (end) {
    $("#usernameInfo").hide();
    if (!hasAt) {
      element.textContent = "@" + element.textContent;
    }
    element.innerHTML = element.textContent;
    resetText(element);
  } else {
    $("#usernameInfo").html(info);
    $("#usernameInfo").show();
  }
}

function charCount(element, end) {
  let length = element.textContent.length;

  if (length > maxChars) {
    // element.textContent = element.textContent.slice(0, maxChars);
    $("#charCounter").html(
      `<span style="color:red">${length}</span>/${maxChars} characters`
    );
  } else {
    $("#charCounter").html(`${length}/${maxChars} characters`);
  }

  if (end) {
    $("#charCounter").hide();
    element.innerHTML = emptyDivs(element);
    let elementUpdated = document.getElementById("tweetText");
    elementUpdated.innerHTML = tgAutoLink(elementUpdated.innerText);
  } else {
    $("#charCounter").show();
  }
}

function editText(element) {
  $("#tweetText .simulatedLink").replaceWith(function () {
    return $(this).html();
  });
  charCount(element);
}

function removeImg() {
  $("#imgFiles").val("");
  $("#imgContainer").hide();
  $("#tweetImg").attr("src", "");
}

function updateImg() {
  let file = document.getElementById("imgFiles").files[0];
  if (file) {
    let fileBlob = URL.createObjectURL(file);
    $("#tweetImg").attr("src", fileBlob);
    $("#imgContainer").show();
  } else {
    removeImg();
  }
}

function getCurrentDate() {
  let d = new Date();
  let time = parseTime(d.getHours()) + ":" + parseTime(d.getMinutes());
  let day = d.getDate();
  let monthNum = d.getMonth();
  let year = d.getFullYear();

  $("#timeInput").val(time);
  $("#dayInput").val(day);
  $("#yearInput").val(year);

  switch (monthNum) {
    case 0:
      $("#monthInput").val("Jan");
      break;
    case 1:
      $("#monthInput").val("Feb");
      break;
    case 2:
      $("#monthInput").val("Mar");
      break;
    case 3:
      $("#monthInput").val("Apr");
      break;
    case 4:
      $("#monthInput").val("May");
      break;
    case 5:
      $("#monthInput").val("Jun");
      break;
    case 6:
      $("#monthInput").val("Jul");
      break;
    case 7:
      $("#monthInput").val("Aug");
      break;
    case 8:
      $("#monthInput").val("Sep");
      break;
    case 9:
      $("#monthInput").val("Oct");
      break;
    case 10:
      $("#monthInput").val("Nov");
      break;
    case 11:
      $("#monthInput").val("Dec");
      break;
  }
}

function updateDate() {
  let day = $("#dayInput").val();
  let month = $("#monthInput").val();
  let year = $("#yearInput").val();
  let time = ampmTime($("#timeInput").val());
  $("#timeOutput").html(time);
  $("#monthOutput").html(month);
  $("#dayOutput").html(day);
  $("#yearOutput").html(year);
}

function editClient() {
  if ($("#client").hasClass("placeholder")) {
    $("#client").html("");
    $("#client").click();
    $("#client").removeClass("placeholder");
  }
  $("#clientInfo").show();
}

function blurClient() {
  if (document.getElementById("client").textContent == "") {
    $("#client").addClass("placeholder");
    $("#client").html("Click to add client...");
  }
  $("#clientInfo").hide();
}

function toggleDebunk() {
  if (!editable) return;
  if (debunk) {
    $("#debunkDisplay").hide();
    $("#debunkText").html("This fact is disputed");
    $("#addOrRemoveDebunk").html("Add");
    debunk = false;
  } else {
    $("#debunkDisplay").show();
    $("#addOrRemoveDebunk").html("Remove");
    debunk = true;
  }
}

function checkDebunk() {
  if (!document.getElementById("debunkText").textContent && debunk)
    toggleDebunk();
}

function checkInteraction(element) {
  let num = Number(element.textContent);
  if (isNaN(num) || num > 9999999999 || num < 0 || !Number.isInteger(num)) {
    $("#invalidNumber").show();
  } else {
    $("#invalidNumber").hide();
  }
}

function startInteraction(option) {
  let num = interactions[option];
  let element = document.getElementById(option);
  if (!isNaN(num)) element.innerHTML = num;
  checkInteraction(element);
}

function parseInteraction(option) {
  let element = document.getElementById(option);
  let num = Number(element.textContent);
  interactions[option] = num;
  if (num == 1) {
    $(`#${option}Plural`).hide();
  } else {
    $(`#${option}Plural`).show();
    if (!isNaN(num)) {
      element.innerHTML = abbrNumber(num);
    }
  }
  $("#invalidNumber").hide();
}

// rt/like randomization
const randomRetweet = [
  69, 2, 531, 310, 2300, 1, 46, 32, 186, 17, 132, 35, 491, 32610, 64, 102, 203,
  1009, 35, 186, 17234, 53420, 2504, 73512, 4, 5477, 4, 2503, 40333, 76, 1234,
  6795, 1, 6, 166, 108, 140, 77, 969, 33, 3, 475, 9, 5577, 43, 6, 8, 87, 141,
  315, 0, 10, 73, 18, 2419, 1314, 18969, 270, 2, 439, 9, 571, 1, 51,
];
const randomQuote = [
  21, 2, 377, 214, 1988, 22, 24, 9, 79, 4, 25, 6, 66, 18928, 32, 30, 51, 5020,
  4, 29, 1124, 22169, 834, 31132, 1, 1403, 0, 660, 11295, 14, 440, 792, 0, 3,
  34, 21, 48, 17, 112, 10, 0, 94, 4, 212, 8, 1, 5, 18, 33, 124, 1, 72, 0, 4,
  511, 175, 1213, 73, 0, 12, 2, 26, 2, 20,
];
const randomLike = [
  420, 21, 7214, 4602, 6589, 18, 1734, 348, 3442, 73, 624, 214, 1880, 74787,
  422, 3414, 6990, 1705, 127, 3720, 79536, 110669, 15671, 325360, 233, 57539,
  70, 20441, 196946, 619, 7211, 19455, 18, 275, 1698, 2632, 481, 492, 5287, 220,
  24, 2899, 26, 20315, 165, 52, 39, 1024, 11002, 1440, 1, 959, 596, 1211, 18748,
  7808, 84696, 5194, 51, 8266, 1377, 5656, 70, 284,
];

function randomize() {
  let rand = Math.floor(Math.random() * randomRetweet.length);
  $("#retweets").html(randomRetweet[rand]);
  parseInteraction("retweets");
  $("#quotes").html(randomQuote[rand]);
  parseInteraction("quotes");
  $("#likes").html(randomLike[rand]);
  parseInteraction("likes");
}

function generate() {
  if (editable) toggleEditing();
  $("#toolbarButtons button").attr("disabled", true);
  $("#generateButton").html(
    '<i class="fas fa-sync-alt spinner"></i>  Please wait...'
  );

  // Putting a delay here to let images load
  setTimeout(function () {
    const capture = document.getElementById("tweetInnerContainer");
    const currentHTML = capture.innerHTML;
    var bgColor = $("#tweetContainer").css("background-color");

    // Workaround for html2canvas issue where <svg> elements don't show up. Thanks nununoisy
    // Fixed in html2canvas v1.1.3
    /* for (let svg of $("#tweetContainer svg")) {
            svg.setAttribute("width", svg.getBoundingClientRect().width);
            svg.setAttribute("height", svg.getBoundingClientRect().height);
            svg.setAttribute("fill", window.getComputedStyle(svg).fill);
        } */

    // Scrolling the window to the top because if the page is scrolled down, then the image gets cut off for some reason
    // Obsolete in html2canvas v1.2.0
    /* try {
            window.scroll({left: 0, top: 0, behavior: 'instant'});
        } catch {
    
        } */

    html2canvas(capture, {
      allowTaint: true,
      backgroundColor: bgColor,
      windowWidth: 640,
    }).then((canvas) => {
      $("#tweetInnerContainer").html(currentHTML);
      canvas.toBlob((blob) => {
        let src = URL.createObjectURL(blob);
        $("body").append(
          `<div class="modal fade" id="generatedImgModal" tabindex="-1"><div class="modal-dialog"><div class="modal-content"><div class="modal-header"><h5 class="modal-title">Image generated</h5></div><div class="modal-body container-fluid"><p>Done! Right-click (or hold down on mobile) on the image and press Save Image to save it to your device.</p><img src="${src}"></div><div class="modal-footer"><button type="button" class="btn btn-primary" data-bs-dismiss="modal">Done</button></div></div></div></div>`
        );
        var modalEl = $("#generatedImgModal");
        var bsModal = new bootstrap.Modal(modalEl);
        $(modalEl).on(
          "hidden.bs.modal",
          { modal: bsModal, element: modalEl },
          (event) => {
            event.data.modal.dispose();
            $(event.data.element).remove();
          }
        );
        bsModal.show();

        $("#toolbarButtons button").attr("disabled", false);
        $("#generateButton").html(
          '<i class="fas fa-download"></i>  Generate image'
        );

        unloadPrompt = false;
        $("body").one("input", function () {
          unloadPrompt = true;
        });
      }, "image/png");
    });
  }, 500);
}

// Creating event listeners for modals
$("#dateModal").on("hide.bs.modal", updateDate);
$("#pfpModal").on("hide.bs.modal", updatePfp);
$("#imgModal").on("hide.bs.modal", updateImg);

// Prevent line breaks on all inputs except tweet text
$("#tweetContainer .editable:not(#tweetText)").on("keydown", (event) => {
  if (event.which == 13) event.preventDefault();
});

toggleEditing();
$("#loading").hide();
$("#toolbarOptions").show();
$("#version").html("BETA-0.5.4");

$("body").one("input", function () {
  unloadPrompt = true;
});

window.addEventListener("beforeunload", function (e) {
  // This is how the "Do you want to leave this site? Changes you made may not be saved." prompt shows up
  if (unloadPrompt) {
    e.preventDefault();
    e.returnValue = "";
  }
});
