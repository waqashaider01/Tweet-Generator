// Places a notice if the user is using an old browser.

try {
  // Uses the object literal spread operator (ECMAScript 2018) to check compatibility
  // Successful on: Chrome 60, Edge 79, Firefox 55, Opera 47, Safari Desktop 11.1, iOS 11.3

  var checkCompatibilityFunction = new Function(
    "arg1",
    "let obj1 = {foo: 'bar', x: 42}; let clonedObj = {...obj1};"
  );
  checkCompatibilityFunction();
} catch (error) {
  var compatBannerElement = document.createElement("div");
  compatBannerElement.className = "errorbanner";
  compatBannerElement.insertAdjacentHTML(
    "afterbegin",
    '<svg aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" style="height:2em;"><path fill="currentColor" d="M569.517 440.013C587.975 472.007 564.806 512 527.94 512H48.054c-36.937 0-59.999-40.055-41.577-71.987L246.423 23.985c18.467-32.009 64.72-31.951 83.154 0l239.94 416.028zM288 354c-25.405 0-46 20.595-46 46s20.595 46 46 46 46-20.595 46-46-20.595-46-46-46zm-43.673-165.346l7.418 136c.347 6.364 5.609 11.346 11.982 11.346h48.546c6.373 0 11.635-4.982 11.982-11.346l7.418-136c.375-6.874-5.098-12.654-11.982-12.654h-63.383c-6.884 0-12.356 5.78-11.981 12.654z"></path></svg><p><strong>Warning:</strong> Your web browser is old. Some or many features <strong>may not work.</strong> For the best experience, use the latest version of a modern browser, such as Chrome or Firefox.</p>'
  );
  document.body.insertBefore(
    compatBannerElement,
    document.getElementsByTagName("nav")[0]
  );
  console.warn(
    "Outdated browser! Browser does not conform to ECMAScript 2018."
  );
}
