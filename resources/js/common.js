initAnalytics();

function initAnalytics()
{
	(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
	(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
	m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
	})(window,document,'script','//www.google-analytics.com/analytics.js','ga');

	ga('create', 'UA-42792257-5', 'xuri.me');
	ga('set', 'forceSSL', true);	// Send all data using SSL, even from insecure (HTTP) pages.
	ga('send', 'pageview');
}

$(function()
{
	var emptyInputMsg = "";
	var emptyOutputMsg = "Go will appear here";
	var formattedEmptyInputMsg = emptyInputMsg;
	var formattedEmptyOutputMsg = '<span style="color: #777;">'+emptyOutputMsg+'</span>';

	// Hides placeholder text
	$('#input').on('focus', function()
	{
		var val = $(this).val();
		if (!val)
		{
			$(this).val(formattedEmptyInputMsg);
			$('#output').html(formattedEmptyOutputMsg);
		}
		else if (val == emptyInputMsg)
			$(this).val("");
	});

	// Shows placeholder text
	$('#input').on('blur', function()
	{
		var val = $(this).val();
		if (!val)
		{
			$(this).val(formattedEmptyInputMsg);
			$('#output').html(formattedEmptyOutputMsg);
		}
	}).blur();

	// Automatically do the conversion
	$('#input').keyup(function()
	{
		var input = $(this).val();
		if (!input)
		{
			$('#output').html(formattedEmptyOutputMsg);
			return;
		}
		try {
			data = JSON.stringify(toml.parse(input), undefined, 2).trim();
			var output = jsonToGo(data);
			if (output.error) {
				$('#output').html('<span class="clr-red">' + output.error + '</span>');
				var parsedError = output.error.match(/Unexpected token .+ in JSON at position (\d+)/);
				if (parsedError) {
					try {
						var faultyIndex = parsedError.length == 2 && parsedError[1] && parseInt(parsedError[1]);
						faultyIndex && $('#output').html(constructJSONErrorHTML(output.error, faultyIndex, input));
					} catch (e) { }
				}
			}
			else {
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
	});

	// Highlights the output for the user
	$('#output').click(function()
	{
		if (document.selection)
		{
			var range = document.body.createTextRange();
			range.moveToElementText(this);
			range.select();
		}
		else if (window.getSelection)
		{
			var range = document.createRange();
			range.selectNode(this);
			selection = window.getSelection();
			selection.removeAllRanges();
			selection.addRange(range);
		}
	});

	// Fill in sample JSON if the user wants to see an example
	$('#sample1').click(function()
	{
		$('#input').val($.trim($("#toml_sample").html())).keyup();
	});
});

// Stringifies JSON in the preferred manner
function stringify(json)
{
	return JSON.stringify(json, null, "\t");
}
