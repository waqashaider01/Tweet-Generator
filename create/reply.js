// JavaScript for Tweetgen Reply Chain Generator
// Requires jQuery
// BETA-0.5.4 - August 12, 2021

const maxCharsQuery = /(\?|&)maxChars=([0-9]+)/i.exec(document.URL); // This implements changing the max character count via the URL. e.g. /reply.html?maxChars=140
const maxChars = maxCharsQuery ? Number(maxCharsQuery[2]) : 280;
var editable = false;
var tweets = $("#tweetContainer .tweet");
var nextId = 2;
var maxTweets = false;
var unloadPrompt = false;
var useTwemoji = true;
var modals = [{}, {}];
const unameRegex = /^@?[A-Za-z0-9_]+$/;
const defaultTweet =
  '<div class="pfpContainer css-1dbjc4n"><img class="pfp editable-border" src="./c/default-pfp.png" width="48" height="48" onclick="queryPfp(this)"><div class="verticalBar verticalBarBottom css-1dbjc4n" style="display:none"></div></div><div class="tweetContentContainer css-1dbjc4n"><div class="tweetHeader css-1dbjc4n"><div class="nameContainer"><div class="name editable editable-border" onfocus="checkName(this)" oninput="checkName(this)" onblur="checkName(this, true)">Name</div><div class="verified" style="display:none"><svg viewBox="0 0 24 24"><g><path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .494.083.964.237 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.163.865.248 1.336.248 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484zm-6.616-3.334l-4.334 6.5c-.145.217-.382.334-.625.334-.143 0-.288-.04-.416-.126l-.115-.094-2.415-2.415c-.293-.293-.293-.768 0-1.06s.768-.294 1.06 0l1.77 1.767 3.825-5.74c.23-.345.696-.436 1.04-.207.346.23.44.696.21 1.04z"></path></g></svg></div><div class="usernameContainer editable editable-border" onfocus="checkUsername(this)" oninput="checkUsername(this)" onblur="checkUsername(this, true)">@Username</div><div class="bullet">·</div><div class="date editable-border" onclick="queryDate(this)">Jun 1</div></div><div class="dropup"><div class="tweetDropdown editable-border" data-bs-toggle="dropdown" aria-label="Tweet options" aria-expanded="false"><svg viewBox="0 0 24 24"><g><circle cx="5" cy="12" r="2"></circle><circle cx="12" cy="12" r="2"></circle><circle cx="19" cy="12" r="2"></circle></g></svg></div><ul class="tweetOptions dropdown-menu ui"><li><button class="dropdown-item" type="button" onclick="toggleVerified(getTweetId(this))"><svg fill="#1da1f2" viewBox="0 0 24 24"><g><path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .494.083.964.237 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.163.865.248 1.336.248 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484zm-6.616-3.334l-4.334 6.5c-.145.217-.382.334-.625.334-.143 0-.288-.04-.416-.126l-.115-.094-2.415-2.415c-.293-.293-.293-.768 0-1.06s.768-.294 1.06 0l1.77 1.767 3.825-5.74c.23-.345.696-.436 1.04-.207.346.23.44.696.21 1.04z"></path></g></svg>Toggle verified badge</button></li><li><button class="dropdown-item" type="button" onclick="queryImg(this)"><i class="fas fa-image"></i> Add image</button></li><li><button class="dropdown-item danger" type="button" onclick="queryDelete(this)"><i class="fas fa-trash"></i> Delete Tweet</button></li></ul></div></div><div class="editorInfo nameInfo ui" style="display:none"></div><div class="tweetContent css-1dbjc4n"><div class="css-1dbjc4n"><span class="tweetText editable editable-border" onfocus="charCount(this)" oninput="charCount(this)" onblur="charCount(this, true)">Your tweet here!</span></div><div class="editorInfo charCount ui" style="display:none"></div><div class="imgContainer editable-border" style="display:none" onclick="queryImg(this)"><img class="img"></div><div class="tweetButtons css-1dbjc4n editable-border" onclick="queryInteractions(this)"><div class="tweetButton css-1dbjc4n"><svg viewBox="0 0 24 24"><g><path d="M14.046 2.242l-4.148-.01h-.002c-4.374 0-7.8 3.427-7.8 7.802 0 4.098 3.186 7.206 7.465 7.37v3.828c0 .108.044.286.12.403.142.225.384.347.632.347.138 0 .277-.038.402-.118.264-.168 6.473-4.14 8.088-5.506 1.902-1.61 3.04-3.97 3.043-6.312v-.017c-.006-4.367-3.43-7.787-7.8-7.788zm3.787 12.972c-1.134.96-4.862 3.405-6.772 4.643V16.67c0-.414-.335-.75-.75-.75h-.396c-3.66 0-6.318-2.476-6.318-5.886 0-3.534 2.768-6.302 6.3-6.302l4.147.01h.002c3.532 0 6.3 2.766 6.302 6.296-.003 1.91-.942 3.844-2.514 5.176z"></path></g></svg><div class="buttonText replies css-1dbjc4n"></div></div><div class="tweetButton css-1dbjc4n"><svg viewBox="0 0 24 24"><g><path d="M23.77 15.67c-.292-.293-.767-.293-1.06 0l-2.22 2.22V7.65c0-2.068-1.683-3.75-3.75-3.75h-5.85c-.414 0-.75.336-.75.75s.336.75.75.75h5.85c1.24 0 2.25 1.01 2.25 2.25v10.24l-2.22-2.22c-.293-.293-.768-.293-1.06 0s-.294.768 0 1.06l3.5 3.5c.145.147.337.22.53.22s.383-.072.53-.22l3.5-3.5c.294-.292.294-.767 0-1.06zm-10.66 3.28H7.26c-1.24 0-2.25-1.01-2.25-2.25V6.46l2.22 2.22c.148.147.34.22.532.22s.384-.073.53-.22c.293-.293.293-.768 0-1.06l-3.5-3.5c-.293-.294-.768-.294-1.06 0l-3.5 3.5c-.294.292-.294.767 0 1.06s.767.293 1.06 0l2.22-2.22V16.7c0 2.068 1.683 3.75 3.75 3.75h5.85c.414 0 .75-.336.75-.75s-.337-.75-.75-.75z"></path></g></svg><div class="buttonText retweets css-1dbjc4n"></div></div><div class="tweetButton css-1dbjc4n"><svg viewBox="0 0 24 24"><g><path d="M12 21.638h-.014C9.403 21.59 1.95 14.856 1.95 8.478c0-3.064 2.525-5.754 5.403-5.754 2.29 0 3.83 1.58 4.646 2.73.814-1.148 2.354-2.73 4.645-2.73 2.88 0 5.404 2.69 5.404 5.755 0 6.376-7.454 13.11-10.037 13.157H12zM7.354 4.225c-2.08 0-3.903 1.988-3.903 4.255 0 5.74 7.034 11.596 8.55 11.658 1.518-.062 8.55-5.917 8.55-11.658 0-2.267-1.823-4.255-3.903-4.255-2.528 0-3.94 2.936-3.952 2.965-.23.562-1.156.562-1.387 0-.014-.03-1.425-2.965-3.954-2.965z"></path></g></svg><div class="buttonText likes css-1dbjc4n"></div></div><div class="tweetButton css-1dbjc4n"><svg viewBox="0 0 24 24"><g><path d="M17.53 7.47l-5-5c-.293-.293-.768-.293-1.06 0l-5 5c-.294.293-.294.768 0 1.06s.767.294 1.06 0l3.72-3.72V15c0 .414.336.75.75.75s.75-.336.75-.75V4.81l3.72 3.72c.146.147.338.22.53.22s.384-.072.53-.22c.293-.293.293-.767 0-1.06z"></path><path d="M19.708 21.944H4.292C3.028 21.944 2 20.916 2 19.652V14c0-.414.336-.75.75-.75s.75.336.75.75v5.652c0 .437.355.792.792.792h15.416c.437 0 .792-.355.792-.792V14c0-.414.336-.75.75-.75s.75.336.75.75v5.652c0 1.264-1.028 2.292-2.292 2.292z"></path></g></svg></div></div></div></div>';

// Raw inputs vs Twemoji-parsed inputs
var tweetRaw = "";
var tweetParsed = "";

function getTweetId(element) {
  // return "#" + $(element).parents(".tweet").attr("id");
  return $(element).parents(".tweet").attr("id").slice(5);
}

function abbrNumber(str) {
  var n = Number(str);
  if (n < 1e3) return n;
  else if (n >= 1e3 && n < 1e6) return +(n / 1e3).toFixed(1) + "K";
  else if (n >= 1e6 && n < 1e9) return +(n / 1e6).toFixed(1) + "M";
  else if (n >= 1e9 && n < 1e12) return +(n / 1e9).toFixed(1) + "B";
  else return str;
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

function addTweet() {
  $(".tweet .verticalBar").show();
  if (tweets.length > 0) {
    $("#tweetInnerContainer").append(
      `<div class="tweetBuffer css-1dbjc4n" id="tweet${nextId}Buffer"><div class="verticalBarTopContainer css-1dbjc4n"><div class="verticalBar verticalBarTop css-1dbjc4n"></div></div></div>`
    );
  }
  $("#tweetInnerContainer").append(
    `<div class="tweet css-1dbjc4n" id="tweet${nextId}">${defaultTweet}</div>`
  );
  tweets = $("#tweetContainer .tweet");
  modals[nextId] = {};
  nextId++;
  $(".editable").attr("contenteditable", true);
  if (tweets.length >= 8) {
    maxTweets = true;
    $("#addTweetBtn").attr("disabled", true);
    $("#addTweetBtn").html("Maximum number of Tweets reached");
  } else {
    maxTweets = false;
    $("#addTweetBtn").attr("disabled", false);
    $("#addTweetBtn").html('<i class="fas fa-plus-circle"></i> Add Tweet');
  }
}

function deleteTweet(id) {
  $(`#tweet${id}`).remove();
  $(`#tweet${id}Buffer`).remove();
  tweets = $("#tweetContainer .tweet");

  var ce = $("#tweetInnerContainer").children();
  $(".verticalBar", tweets[tweets.length - 1]).hide();
  if ($(ce[0]).hasClass("tweetBuffer")) $(ce[0]).remove();
  if ($(ce[ce.length - 1]).hasClass("tweetBuffer"))
    $(ce[ce.length - 1]).remove();
}

function disposeModals(event) {
  var id = event.data.tweetId;
  if ($(`#tweet${id}`).length == 0) {
    for (let prop in modals[id]) {
      let element = modals[id][prop]["_element"];
      modals[id][prop].dispose();
      $(element).remove();
    }
    modals[id] = {};
  }
}

function toggleEditing() {
  if (editable) {
    tweetRaw = $("#tweetContainer").html();
    $(".editable").attr("contenteditable", false);
    $("#tweetContainer").attr("editing", "off");
    editable = false;
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

function checkName(element, end) {
  let length = element.textContent.length;
  let counter = $(element).parents(".tweetHeader").siblings(".nameInfo");

  if (length > 50) {
    $(counter).html(`<span style="color:red">${length}</span>/50 characters`);
  } else {
    $(counter).html(`${length}/50 characters`);
  }

  if (end) {
    $(counter).hide();
    resetText(element);
  } else {
    $(counter).show();
  }
}

function checkUsername(element, end) {
  let hasAt = element.textContent.startsWith("@");
  let length = hasAt
    ? element.textContent.length - 1
    : element.textContent.length;
  let counter = $(element).parents(".tweetHeader").siblings(".nameInfo");
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
    $(counter).hide();
    if (!hasAt) {
      element.textContent = "@" + element.textContent;
    }
    element.innerHTML = element.textContent;
    resetText(element);
  } else {
    $(counter).html(info);
    $(counter).show();
  }
}

function charCount(element, end) {
  let id = getTweetId(element);
  let length = element.textContent.length;
  let counter = $(`#tweet${id} .charCount`);

  if (length > maxChars) {
    // element.textContent = element.textContent.slice(0, maxChars);
    $(counter).html(
      `<span style="color:red">${length}</span>/${maxChars} characters`
    );
  } else {
    $(counter).html(`${length}/${maxChars} characters`);
  }

  if (end) {
    $(counter).hide();
    element.innerHTML = emptyDivs(element);
    let elementUpdated = $(`#tweet${id} .tweetText`)[0];
    elementUpdated.innerHTML = tgAutoLink(elementUpdated.innerText);
  } else {
    $(counter).show();
  }
}

function toggleVerified(id) {
  $("#tweet" + id + " .verified").toggle();
}

function getModal(type, id) {
  if ($(`#${type}Modal${id}`)[0]) {
    return document.getElementById(`#${type}Modal${id}`);
  } else {
    var modalEl;
    switch (type) {
      case "date":
        $("body").append(
          `<div class="modal fade" id="dateModal${id}" tabindex="-1"><div class="modal-dialog"><div class="modal-content"><div class="modal-header"><h5 class="modal-title">Change Tweet's date</h5></div><div class="modal-body"><div class="container-fluid"><div class="row modalForm"><div class="col"><label for="dateModal${id}Day">Day</label><input type="number" class="form-control" id="dateModal${id}Day" value="1" min="1" max="31" step="1"></div><div class="col"><label for="dateModal${id}Month">Month</label><select class="form-select" id="dateModal${id}Month"><option value="Jan">Jan</option><option value="Feb">Feb</option><option value="Mar">Mar</option><option value="Apr">Apr</option><option value="May">May</option><option value="Jun" selected>Jun</option><option value="Jul">Jul</option><option value="Aug">Aug</option><option value="Sep">Sep</option><option value="Oct">Oct</option><option value="Nov">Nov</option><option value="Dec">Dec</option></select></div><div class="col"><label for="dateModal${id}Year">Year</label><input type="number" class="form-control" id="dateModal${id}Year" value="" min="1" max="9999" step="1"></div></div></div><button type="button" class="btn btn-link" onclick="getCurrentDate(${id})"><i class="far fa-clock"></i> Use current date</button></div><div class="modal-footer"><button type="button" class="btn btn-primary" data-bs-dismiss="modal">Done</button></div></div></div></div>`
        );
        modalEl = document.getElementById(`dateModal${id}`);
        modals[Number(id)]["date"] = new bootstrap.Modal(modalEl);
        return modalEl;
      case "pfp":
        $("body").append(
          `<div class="modal fade" id="pfpModal${id}" tabindex="-1"><div class="modal-dialog"><div class="modal-content"><div class="modal-header"><h5 class="modal-title">Change Tweet's profile picture</h5></div><div class="modal-body"><div class="modalForm"><label>Upload image</label><input type="file" accept="image/*" id="pfpModal${id}Files"><small class="inputinfo">Make sure your image is square, otherwise it may get stretched.</small></div><button type="button" class="btn btn-link" onclick="resetPfp(${id})"><i class="fas fa-trash"></i> Reset image to default</button></div><div class="modal-footer"><button type="button" class="btn btn-primary" data-bs-dismiss="modal">Done</button></div></div></div></div>`
        );
        modalEl = document.getElementById(`pfpModal${id}`);
        modals[Number(id)]["pfp"] = new bootstrap.Modal(modalEl);
        return modalEl;
      case "img":
        $("body").append(
          `<div class="modal fade" id="imgModal${id}" tabindex="-1"><div class="modal-dialog"><div class="modal-content"><div class="modal-header"><h5 class="modal-title">Add or change Tweet's image</h5></div><div class="modal-body"><div class="modalForm"><label>Upload image</label><input type="file" accept="image/*" id="imgModal${id}Files"></div><button type="button" class="btn btn-link" onclick="resetImg(${id})"><i class="fas fa-trash"></i> Remove image</button></div><div class="modal-footer"><button type="button" class="btn btn-primary" data-bs-dismiss="modal">Done</button></div></div></div></div>`
        );
        modalEl = document.getElementById(`imgModal${id}`);
        modals[Number(id)]["img"] = new bootstrap.Modal(modalEl);
        return modalEl;
      case "interactions":
        $("body").append(
          `<div class="modal fade" id="interactionsModal${id}" tabindex="-1"><div class="modal-dialog"><div class="modal-content"><div class="modal-header"><h5 class="modal-title">Change Replies, Retweets, and Likes</h5></div><div class="modal-body container-fluid"><div class="modalForm row"><div class="col-sm"><label for="interactionsModal${id}Replies">Replies</label><input type="number" class="form-control" id="interactionsModal${id}Replies" value="0" min="0" max="9999999999" step="1" oninput="validateInteraction(this)"><small class="error"></small></div><div class="col-sm"><label for="interactionsModal${id}Retweets">Retweets</label><input type="number" class="form-control" id="interactionsModal${id}Retweets" value="0" min="0" max="9999999999" step="1" oninput="validateInteraction(this)"><small class="error"></small></div><div class="col-sm"><label for="interactionsModal${id}Likes">Likes</label><input type="number" class="form-control" id="interactionsModal${id}Likes" value="0" min="0" max="9999999999" step="1" oninput="validateInteraction(this)"><small class="error"></small></div></div><button type="button" class="btn btn-link" onclick="randomizeInteractions(${id})"><i class="fas fa-random"></i> Randomize</button></div><div class="modal-footer"><button type="button" class="btn btn-primary" data-bs-dismiss="modal">Done</button></div></div></div></div>`
        );
        modalEl = document.getElementById(`interactionsModal${id}`);
        modals[Number(id)]["interactions"] = new bootstrap.Modal(modalEl);
        return modalEl;
      case "delete":
        $("body").append(
          `<div class="modal fade" id="deleteModal${id}" tabindex="-1"><div class="modal-dialog"><div class="modal-content"><div class="modal-header"><h5 class="modal-title">Delete Tweet</h5></div><div class="modal-body container-fluid">Are you sure you would like to delete this Tweet? This cannot be undone. </div><div class="modal-footer"><button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button><button type="button" class="btn btn-danger" data-bs-dismiss="modal" onclick="deleteTweet(${id})">Delete</button></div></div></div></div>`
        );
        modalEl = document.getElementById(`deleteModal${id}`);
        modals[Number(id)]["delete"] = new bootstrap.Modal(modalEl);
        return modalEl;
    }
  }
}

function getCurrentDate(id) {
  var d = new Date();
  var day = d.getDate();
  var month = d.getMonth();
  var year = d.getFullYear();

  switch (month) {
    case 0:
      $(`#dateModal${id}Month`).val("Jan");
      break;
    case 1:
      $(`#dateModal${id}Month`).val("Feb");
      break;
    case 2:
      $(`#dateModal${id}Month`).val("Mar");
      break;
    case 3:
      $(`#dateModal${id}Month`).val("Apr");
      break;
    case 4:
      $(`#dateModal${id}Month`).val("May");
      break;
    case 5:
      $(`#dateModal${id}Month`).val("Jun");
      break;
    case 6:
      $(`#dateModal${id}Month`).val("Jul");
      break;
    case 7:
      $(`#dateModal${id}Month`).val("Aug");
      break;
    case 8:
      $(`#dateModal${id}Month`).val("Sep");
      break;
    case 9:
      $(`#dateModal${id}Month`).val("Oct");
      break;
    case 10:
      $(`#dateModal${id}Month`).val("Nov");
      break;
    case 11:
      $(`#dateModal${id}Month`).val("Dec");
      break;
  }

  $(`#dateModal${id}Day`).val(day);
  $(`#dateModal${id}Year`).val(year);
}

function updateDate(event) {
  let id = event.data.tweetId;
  let newDate = "";
  let year = $(`#dateModal${id}Year`).val();
  if (year) {
    newDate = `${$(`#dateModal${id}Month`).val()} ${$(
      `#dateModal${id}Day`
    ).val()}, ${year}`;
  } else {
    newDate = `${$(`#dateModal${id}Month`).val()} ${$(
      `#dateModal${id}Day`
    ).val()}`;
  }
  $(`#tweet${id} .date`).html(newDate);
}

function queryDate(element) {
  if ($("#tweetContainer").attr("editing") == "off") return;
  var id = getTweetId(element);
  var modalEl = getModal("date", id);
  $(modalEl).on("hide.bs.modal", { tweetId: id }, updateDate);
  modals[Number(id)]["date"].show();
}

function resetPfp(id) {
  $(`#pfpModal${id}Files`).val("");
  $(`#tweet${id} .pfp`).attr("src", "/c/default-pfp.png");
}

function updatePfp(event) {
  let id = event.data.tweetId;
  let file = document.getElementById(`pfpModal${id}Files`).files[0];
  if (file) {
    let fileBlob = URL.createObjectURL(file);
    $(`#tweet${id} .pfp`).attr("src", fileBlob);
  } else {
    $(`#tweet${id} .pfp`).attr("src", "/c/default-pfp.png");
  }
}

function queryPfp(element) {
  if ($("#tweetContainer").attr("editing") == "off") return;
  var id = getTweetId(element);
  var modalEl = getModal("pfp", id);
  $(modalEl).on("hide.bs.modal", { tweetId: id }, updatePfp);
  modals[Number(id)]["pfp"].show();
}

function resetImg(id) {
  $(`#imgModal${id}Files`).val("");
  $(`#tweet${id} .imgContainer`).hide();
  $(`#tweet${id} .img`).attr("src", "");
}

function updateImg(event) {
  let id = event.data.tweetId;
  let file = document.getElementById(`imgModal${id}Files`).files[0];
  if (file) {
    let fileBlob = URL.createObjectURL(file);
    $(`#tweet${id} .img`).attr("src", fileBlob);
    $(`#tweet${id} .imgContainer`).show();
  } else {
    $(`#tweet${id} .imgContainer`).hide();
    $(`#tweet${id} .img`).attr("src", "");
  }
}

function queryImg(element) {
  if ($("#tweetContainer").attr("editing") == "off") return;
  var id = getTweetId(element);
  var modalEl = getModal("img", id);
  $(modalEl).on("hide.bs.modal", { tweetId: id }, updateImg);
  modals[Number(id)]["img"].show();
}

function validateInteraction(element) {
  if (!element.value) {
    $(element).siblings(".error").html("");
    return;
  }
  let val = Number(element.value);
  if (Number.isInteger(val) && val < 1e12 && val > -100) {
    $(element).siblings(".error").html("");
  } else {
    $(element)
      .siblings(".error")
      .html(
        "Error: Invalid number. <strong>It may fail to display.</strong> Number should be an integer between 0 and 9999999999."
      );
  }
}

const randomReply = [
  21, 2, 204, 2, 2, 1, 0, 44, 342, 35, 27, 84, 1, 64, 17, 1, 4, 9, 415, 1, 377,
  24, 64, 8, 32, 87, 5, 2, 4, 429, 6220, 5309, 16594, 353, 39, 156, 23, 10, 102,
  2164, 5, 193, 1631, 9, 17, 5, 7, 10, 3, 16, 3, 4, 453, 420, 37340, 1511, 22,
  160, 5, 7, 6, 16, 37, 3,
];
const randomRetweet = [
  69, 2, 531, 0, 1, 30, 5, 251, 771, 1466, 1068, 5359, 3, 737, 39, 0, 1, 77,
  148, 3, 26124, 4005, 27, 5, 10, 6978, 2, 112, 1, 157, 6776, 3381, 23244, 5292,
  27, 484, 43, 2, 23, 2525, 11, 86, 8407, 0, 2, 0, 1, 1, 1, 63, 2, 8, 567, 355,
  43381, 9769, 3, 895, 0, 0, 0, 50, 409, 6,
];
const randomLike = [
  420, 21, 7214, 1, 6, 314, 38, 4539, 12514, 14489, 16921, 60002, 40, 9394, 400,
  1, 74, 623, 935, 32, 262590, 21301, 9, 114, 350, 37232, 37, 849, 4, 585,
  54769, 16774, 159118, 23007, 952, 2258, 127, 2, 995, 87731, 113, 4088, 57205,
  7, 26, 3, 16, 11, 22, 2759, 13, 23, 4148, 2191, 45990, 30212, 249, 4944, 9, 5,
  0, 399, 4032, 42,
];

function randomizeInteractions(id) {
  let rand = Math.floor(Math.random() * randomReply.length);
  $(`#interactionsModal${id}Replies`).val(randomReply[rand]);
  $(`#interactionsModal${id}Retweets`).val(randomRetweet[rand]);
  $(`#interactionsModal${id}Likes`).val(randomLike[rand]);
}

function updateInteractions(event) {
  let id = event.data.tweetId;
  let replies = $(`#interactionsModal${id}Replies`).val();
  let retweets = $(`#interactionsModal${id}Retweets`).val();
  let likes = $(`#interactionsModal${id}Likes`).val();

  if (replies == "0" || !replies) {
    $(`#tweet${id} .replies`).html("");
  } else {
    $(`#tweet${id} .replies`).html(abbrNumber(replies));
  }

  if (retweets == "0" || !retweets) {
    $(`#tweet${id} .retweets`).html("");
  } else {
    $(`#tweet${id} .retweets`).html(abbrNumber(retweets));
  }

  if (likes == "0" || !likes) {
    $(`#tweet${id} .likes`).html("");
  } else {
    $(`#tweet${id} .likes`).html(abbrNumber(likes));
  }
}

function queryInteractions(element) {
  if ($("#tweetContainer").attr("editing") == "off") return;
  var id = getTweetId(element);
  var modalEl = getModal("interactions", id);
  $(modalEl).on("hide.bs.modal", { tweetId: id }, updateInteractions);
  modals[Number(id)]["interactions"].show();
}

function queryDelete(element) {
  if ($("#tweetContainer").attr("editing") == "off") return;
  var id = getTweetId(element);
  var modalEl = getModal("delete", id);
  $(modalEl).on("hidden.bs.modal", { tweetId: id }, disposeModals);
  modals[Number(id)]["delete"].show();
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

// Prevent line breaks on all inputs except tweet text
$("#tweetContainer .editable:not(.tweetText)").on("keydown", (event) => {
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
