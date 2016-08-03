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
	var emptyInputMsg = "Paste TOML here";
	var emptyOutputMsg = "Go will appear here";
	var formattedEmptyInputMsg = '<span style="color: #777;">'+emptyInputMsg+'</span>';
	var formattedEmptyOutputMsg = '<span style="color: #777;">'+emptyOutputMsg+'</span>';

	// Hides placeholder text
	$('#input').on('focus', function()
	{
		var val = $(this).text();
		if (!val)
		{
			$(this).html(formattedEmptyInputMsg);
			$('#output').html(formattedEmptyOutputMsg);
		}
		else if (val == emptyInputMsg)
			$(this).html("");
	});

	// Shows placeholder text
	$('#input').on('blur', function()
	{
		var val = $(this).text();
		if (!val)
		{
			$(this).html(formattedEmptyInputMsg);
			$('#output').html(formattedEmptyOutputMsg);
		}
	}).blur();

	// Automatically do the conversion
	$('#input').keyup(function()
	{
		var input = $(this).text();
		if (!input)
		{
			$('#output').html(formattedEmptyOutputMsg);
			return;
		}

        data = JSON.stringify(toml(input), undefined, 2).trim();
		var output = jsonToGo(data);

		if (output.error)
			$('#output').html('<span class="clr-red">'+output.error+'</span>');
		else
		{
			var coloredOutput = hljs.highlight("go", output.go);
			$('#output').html(coloredOutput.value);
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
			window.getSelection().addRange(range);
		}
	});

	// Fill in sample JSON if the user wants to see an example
	$('#sample1').click(function()
	{
		$('#input').text($.trim($("#toml_sample").html())).keyup();
	});
});

// Stringifies JSON in the preferred manner
function stringify(json)
{
	return JSON.stringify(json, null, "\t");
}
