$(document).ready(function(){
	//displaying the sneakpeak feature
	$(document).on("click", ".icon-eye-open,.icon-eye-close", function() {
		var item = $(this);
		$(this).toggleClass("icon-eye-open")
		$(this).toggleClass("icon-eye-close")
		//checking if there already is data information
		if(!$(this).parent().parent().next().hasClass("infoMeta")) {
			//if not, load in the metadata
			$('.infoMeta').remove()
			var link = driPath + "objects/" + $(this).attr("data-id");
			loadData(link, function(data) {
				displayData(data, item, link)
			});

		} else {
			//if it has don't remove the info
			$('.infoMeta').remove()
		}

	})
	
	$(document).on("click", "tr .collapse", function() {
		$(this).nextAll().toggle()
		$("i", this).toggleClass("icon-plus")
		$("i", this).toggleClass("icon-minus")
	})


})

function createPagination(meta) {
	var startPage;
	var endPage;
	var currentPage = parseInt(meta.page) + 1

	//checks gives the ten value
	var start = Math.floor(currentPage / amountPages) * amountPages
	//if the page number is higher then 10
	if(start > 0) {
		//checks if the difference between the currentPage and the last page
		//is bigger then half of the amount of pages displayed
		if((meta.numPages - currentPage) > (amountPages / 2)) {
			startPage = currentPage - Math.floor(amountPages / 2);
			endPage = currentPage + Math.floor(amountPages / 2);
		} else {
			startPage = currentPage - Math.floor(amountPages / 2);
			endPage = meta.numPages;
		}
	} else {
		//checks if the currentpage is higher then the middle value of the pages in the bar
		if((start + amountPages - currentPage) < (start + amountPages / 2)) {
			var diff = Math.floor(amountPages / 2 - (amountPages - currentPage))
			startPage = start + diff
			
			if(start + diff + amountPages <= meta.numPages) {
				endPage = start + diff + amountPages;
			} else {
				endPage = meta.numPages
			}
		} else {
			startPage = 1;
			if(meta.numPages < amountPages){
				endPage = meta.numPages;
			}else{
			endPage = amountPages;
			}
		}
	}

	var pagination = $(".pagination ul").empty();
	var pos = Backbone.history.fragment.indexOf('/')
	var id = Backbone.history.fragment.substring(0, pos)
	//if there is no page request
	if(pos == -1) {
		id = Backbone.history.fragment
	}
	if(id == "id" || id == "pd") {

		if(Backbone.history.fragment.lastIndexOf('/') > 2) {
			id += Backbone.history.fragment.substring(pos, Backbone.history.fragment.lastIndexOf('/'))
		} else {
			id += Backbone.history.fragment.substr(pos)
		}
	}

	if(meta.numPages < 2) {
		return
	}

	// Create pagination
	// Add general back button
	var a = $("<a>").text("<<").attr('href', '#' + id + "/" + (currentPage - 1))
	var goBack = $("<li>").append(a);
	if(currentPage < 2) {
		goBack.addClass('disabled')
		a.click(function(e) {
			e.preventDefault();
		})
	}
	pagination.append(goBack)
	if(startPage > 1) {
		var li = $("<li>")
		var a = $("<a>").attr('href', '#' + id + "/" + 1).text(1)
		li.append(a);
		pagination.append(li);
		pagination.append($("<li><a>...</a></li>"))
	}
	// Add pages
	for(var i = startPage; i <= endPage; i++) {
		var pagecntrl = $("<li>")
		var a = $("<a>")
		if(i == currentPage) {
			pagecntrl.addClass('active')
			a.click(function(event) {
				event.preventDefault();
			})
		}
		a.attr('href', '#' + id + "/" + i).text(i)
		pagecntrl.append(a)
		pagination.append(pagecntrl)
	};
	//Add last page to the end if there are more pages then the amount of pages that are allowed to be displayed (config file)
	if((meta.numPages - currentPage) > (amountPages / 2) && meta.numPages > amountPages) {
		pagination.append($("<li><a>...</a></li>"))
		var li = $("<li>")
		var a = $("<a>").attr('href', '#' + id + "/" + meta.numPages).text(meta.numPages)
		li.append(a);
		pagination.append(li);
	}

	// Add general forward button
	var a = $("<a>").text(">>").attr('href', '#' + id + "/" + (currentPage + 1))
	var goForward = $("<li>").append(a);
	if(meta.page > (meta.numPages - 2)) {
		goForward.addClass('disabled')
		a.click(function(e) {
			goDeeper = true;
			e.preventDefault();
		})
	}
	pagination.append(goForward)
}

//general load of data
function loadData(link, callback, error) {
	$.ajax({
		url : socket + link,
		cache : false,
		type : "GET",
		dataType : 'jsonp',
		timeout : 10000,
		success : function(data, status, r) {
			if(data.objects) {
				callback(data.objects, data.meta);
			} else {
				callback(data);
			}
		},
		error : function(x, h, r) {
			if(r == "timeout") {
				error("Connection to the API could not be established")
			} else {
				error(x)
			}
			console.log(x);

		}
	});

}

//create a loading row in the tables
function createLoadingRow(table) {
	var tr = $("<tr>").attr('class', 'loadingDiv')
	var loading = $("<i>").addClass('icon-refresh')
	var td = $("<td>").attr('colspan', '7').text(" Loading...");
	tr.append(td.prepend(loading));
	$(table).append(tr)
}

//displays the data in the sneakpeak option
function displayData(data, obj, link) {
	var root = "<table class='table-bordered infoFloat span6'>"
	root += "<tr class='collapse'><th colspan='2'><i class='icon-minus'></i><h2>Object data</h2></th></tr><tr><th>type</th><th>data</th>";
	for(var i in data) {

		if(i != "properties" && i != "fileLocation") {
			root += "<tr><td>" + i + "</td><td>" + data[i] + "</td><tr>"
		}

	}
	root +=  "<tr><td>Json</td><td><a href='"+socket+link+"' target='_blank'>" + link + "</a></td><tr>";
	if(data.properties != undefined){
	root +=  "<tr><td>Dublin core</td><td><a href='"+socket+link+".dc' target='_blank'>" + link + ".dc</a></td><tr>";
	}
	if(data.fileLocation) {
		root += "</table><table class='table-bordered span6 infoFloat'><tr class='collapse'><th colspan='2'><i class='icon-plus'></i><h2>Files</h2></th></tr>";
		for(var i = 0; i < data.fileLocation.length; i++) {
			root += "<tr><td colspan='2'><a href='" + publicDirectory + "/" + data.fileLocation[i].fileLocation + "'>" + data.fileLocation[i].fileLocation + "</a></td></tr>";
		}
	}

	root += "</table>"
	var properties = "<table class='table-bordered infoFloat span6'><tr class='collapse'><th colspan='2'><i class='icon-plus'></i><h2>Properties</h2></th><tr>";
	
	for(var i in data.properties) {
		var item = i;
		properties += "<tr><th colspan='2'><h3>" + i + "</h3></th><tr>";
		for(var j in data.properties[i]) {
			var info = data.properties[item][j]
			for(z in info) {
				if( typeof info[z] == "object") {
					for(k in info[z]){
						var dataObj = info[z][k];
						properties += "<tr><th colspan='2'>" + k+ "</th><tr>"
						for(var l in dataObj){
							properties += "<tr><td>" + l + "</td><td>" + dataObj[l] + "</td><tr>"
						}
					}
					
				} else {
					properties += "<tr><td>" + z + "</td><td>" + info[z] + "</td><tr>"
				}
			}
		}
	}
	
	if(data.properties == undefined){
		properties += "<tr><td colspan='2'>None</td></tr>"
	}

	properties += "</table>"
	$(obj).parent().parent().after("<tr class='infoMeta'><td colspan='7'>" + properties + root + "</td></tr>")
	$("tr .collapse").eq(0).nextAll().show()
}


function titleCheck(item, callback) {
	var title = '-';
	if(( typeof item.properties) != undefined) {
		if(item.properties.titleInfo) {
			if(item.properties.titleInfo[0]) {
				title = item.properties.titleInfo[0].title;
			}

		}
	}

	if(( typeof item.fileLocation) != "undefined") {

		if(( typeof item.properties) == undefined) {
			var nameStart = item.fileLocation[0].fileLocation.indexOf("/") + 1;
			title = item.fileLocation[0].fileLocation.substring(nameStart);
		} else if(( typeof item.properties.titleInfo.length) == "undefined") {
			var nameStart = item.fileLocation[0].fileLocation.indexOf("/") + 1;
			title = item.fileLocation[0].fileLocation.substring(nameStart);

		}
	}
	callback(title)
}

