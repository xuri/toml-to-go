initAnalytics();

function initAnalytics()
{
    (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
    (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
    m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
    })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

    ga('create', 'UA-42792257-5', 'xuri.me');
    ga('set', 'forceSSL', true);    // Send all data using SSL, even from insecure (HTTP) pages.
    ga('send', 'pageview');
}

function setCookie(key, value) {
    var expires = new Date();
    expires.setTime(expires.getTime() + (90 * 24 * 60 * 60 * 1000));
    document.cookie = key + '=' + value + ';expires=' + expires.toUTCString();
}

function getCookie(key) {
    var keyValue = document.cookie.match('(^|;) ?' + key + '=([^;]*)(;|$)');
    return keyValue ? keyValue[2] : null;
}

$(function () {
    const emptyInputMsg = "";
    const emptyOutputMsg = "Go will appear here";
    const formattedEmptyInputMsg = emptyInputMsg;
    const formattedEmptyOutputMsg = '<span style="color: #777;">' + emptyOutputMsg + '</span>';

    function doConversion() {
        var input = $('#input').val();
        if (!input) {
            $('#output').html(formattedEmptyOutputMsg);
            return;
        }
        try {
            data = JSON.stringify(toml.parse(input), undefined, 2).trim();
            let output = jsonToGo(data, "", !$('#inline').is(':checked'), false);

            if (output.error) {
                $('#output').html('<span class="clr-red">' + output.error + '</span>');
                console.log("ERROR:", output, output.error);
                var parsedError = output.error.match(/Unexpected token .+ in JSON at position (\d+)/);
                if (parsedError) {
                    try {
                        var faultyIndex = parsedError.length == 2 && parsedError[1] && parseInt(parsedError[1]);
                        faultyIndex && $('#output').html(constructJSONErrorHTML(output.error, faultyIndex, input));
                    } catch (e) {}
                }
            } else {
                var finalOutput = output.go;
                if (typeof gofmt === 'function')
                    finalOutput = gofmt(output.go);
                var coloredOutput = hljs.highlight("go", finalOutput);
                $('#output').html(coloredOutput.value);
            }
        } catch (exc) {
            if (exc.line && exc.column) {
                data = "Error at line " + exc.line + " column " + exc.column + ":\n" + exc.message
                $('#output').html('<span class="clr-red">' + data + '</span>');
            } else {
                data = exc.message;
                $('#output').html('<span class="clr-red">' + data + '</span>');
            }
        }
    }

    // Hides placeholder text
    $('#input').on('focus', function () {
        var val = $(this).val();
        if (!val) {
            $(this).html(formattedEmptyInputMsg);
            $('#output').html(formattedEmptyOutputMsg);
        } else if (val == emptyInputMsg)
            $(this).html("");
    });

    // Shows placeholder text
    $('#input').on('blur', function () {
        var val = $(this).val();
        if (!val) {
            $(this).html(formattedEmptyInputMsg);
            $('#output').html(formattedEmptyOutputMsg);
        }
    }).blur();

    // If tab is pressed, insert a tab instead of focusing on next element
    $('#input').keydown(function (e) {
        if (e.keyCode == 9) {
            document.execCommand('insertHTML', false, '&#009'); // insert tab
            e.preventDefault(); // don't go to next element
        }
    });

    // Automatically do the conversion on paste or change
    $('#input').keyup(function () {
        doConversion();
    });

    // Also do conversion when inlining preference changes
    $('#inline').change(function () {
        doConversion();
    })

    // Highlights the output for the user
    $('#output').click(function () {
        if (document.selection) {
            var range = document.body.createTextRange();
            range.moveToElementText(this);
            range.select();
        } else if (window.getSelection) {
            var range = document.createRange();
            range.selectNode(this);
            var sel = window.getSelection();
            sel.removeAllRanges(); // required as of Chrome 60: https://www.chromestatus.com/features/6680566019653632
            sel.addRange(range);
        }
    });

    // Fill in sample JSON if the user wants to see an example
    $('#sample1').click(function () {
        $('#input').val(sampleTOML).keyup();
    });

    var dark = false;
    var dark_mode = getCookie("dark_mode");
    if (dark_mode != null) {
        dark = (dark_mode === 'true');
        if (dark) {
            $("head").append("<link rel='stylesheet' href='resources/css/dark.css' id='dark-css'>");
            $("#dark").html("Light mode");
        } else {
            $("#dark-css").remove();
            $("#dark").html("Dark mode");
        }
    }
    $("#dark").click(function () {
        if (!dark) {
            $("head").append("<link rel='stylesheet' href='resources/css/dark.css' id='dark-css'>");
            $("#dark").html("Light mode");
            setCookie("dark_mode", true);
        } else {
            $("#dark-css").remove();
            $("#dark").html("Dark mode");
            setCookie("dark_mode", false);
        }
        dark = !dark;
    });
});

function constructJSONErrorHTML(rawErrorMessage, errorIndex, json) {
    var errorHeading = '<p><span class="clr-red">' + rawErrorMessage + '</span><p>';
    var markedPart = '<span class="json-go-faulty-char">' + json[errorIndex] + '</span>';
    var markedJsonString = [json.slice(0, errorIndex), markedPart, json.slice(errorIndex + 1)].join('');
    var jsonStringLines = markedJsonString.split(/\n/);
    for (var i = 0; i < jsonStringLines.length; i++) {

        if (jsonStringLines[i].indexOf('<span class="json-go-faulty-char">') > -1) // faulty line
            var wrappedLine = '<div class="faulty-line">' + jsonStringLines[i] + '</div>';
        else
            var wrappedLine = '<div>' + jsonStringLines[i] + '</div>';

        jsonStringLines[i] = wrappedLine;
    }
    return (errorHeading + jsonStringLines.join(''));
}

// Stringifies JSON in the preferred manner
function stringify(json) {
    return JSON.stringify(json, null, "\t");
}

var sampleTOML = `# This is a TOML document. Boom.

title = "TOML Example"

[owner]
name = "Tom Preston-Werner"
organization = "GitHub"
bio = "GitHub Cofounder & CEO\nLikes tater tots and beer."
dob = 1979-05-27T07:32:00Z # First class dates? Why not?

[database]
server = "192.168.1.1"
ports = [ 8001, 8001, 8002 ]
connection_max = 5000
enabled = true

[servers]

    # You can indent as you please. Tabs or spaces. TOML don't care.
    [servers.alpha]
    ip = "10.0.0.1"
    dc = "eqdc10"

    [servers.beta]
    ip = "10.0.0.2"
    dc = "eqdc10"

[clients]

# Line breaks are OK when inside arrays
hosts = [
    "alpha",
    "omega"
]`
