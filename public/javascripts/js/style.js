/**
 * @author Matthias Van Wambeke
 * ONLY the edit and create page use this file. For Admin page js please refer to admin-style.js
 */

//starts when the main html file is loaded
$(document).ready(function() {
	$("#step2,#step2Info,#step3,#step3Info,#step4,#step4Info,#step5,#step5Info").hide();
	loadBtnActions();
	switch(window.location.pathname) {
		case "/edit":
			editAction();
			break;
	}

});

/* Function: editActions

 Loads actions for the edit page
 */
function editAction() {

	//loadAllItems();


	//Highlights the selected item in the list
	$(document).on("click",".items li a", function(event) {
		event.preventDefault();
		$(".items li").removeClass("accordion-heading-focus");
		$(this).parent().addClass("accordion-heading-focus");
		$(".items li").eq($(this).parent().index()).addClass("accordion-heading-focus");
	})
	
	$(document).on("click","#boxFiles ul a",function(event){
		event.preventDefault();
		var index = $(this).parent().index();
		var pos = $(".items li.accordion-heading-focus").attr('data-pos');
		$(this).parent().remove()
		editItems[pos].fileLocation.splice(index,1)

	})
}

 /*
 loads the items that you want to edit
 */
function showItems(items) {
	var root = "";
	$(".items ul").empty();

	for(var i = 0; i < items.length; i++) {
		var label = "IN-"+items[i].label.substring(0, amountLblChars);
		var title = "-"
		//checking if the tile is defined or not
		if(( typeof items[i].properties) != "undefined") {
				if(items[i].properties.titleInfo) {
				title = items[i].properties.titleInfo[0].title;
				}
			}

		if(( typeof items[i].fileLocation) != "undefined") {
			if(( typeof items[i].properties ) == "undefined") {
				var nameStart = items[i].fileLocation[0].fileLocation.indexOf("/") + 1;
				title = items[i].fileLocation[0].fileLocation.substring(nameStart);
			} else if(( typeof items[i].properties.titleInfo) == "undefined") {
				var nameStart = items[i].fileLocation[0].fileLocation.indexOf("/") + 1;
				title = items[i].fileLocation[0].fileLocation.substring(nameStart);
			}
		}


		root += "<li data-pos='" + i + "'><a data-type='" + items[i].type + "'  href='" + items[i]._id + "'>" + label + " / " + title + "</a></li>";
		if(i == items.length - 1) {
			$(".items ul").append(root);
		}

	}
	$(".items li:first").addClass("accordion-heading-focus");

}

var itemPos = 0;
//filling up the edit form with the correct data.
function fillUpForm(data) {
	itemPos = 0;
	emptyForm()
	var position = 0;
	for(var i in data.properties) {
		var item = i;
		for(var j in data.properties[i]) {
			var info = data.properties[item][j]
			addEditFormFields(info,item);
			for(i in info) {
				$("#" + $('[name="' + i + '"]:last').attr("id")).val(info[i])
				if( typeof info[i] == "object") {
					$.fn.reverse = [].reverse; 
					$(".dataform ul").eq(itemPos).empty()
					fillInSpecialDataFields(info[i],i,item)
				}
			}

		}
		position++;
	}
	//added files to the form if they are there
	if(data.fileLocation) {
		var root = "<div class = 'formInput' id='boxFiles'><h3>Files</h3><hr><ul>"
		for(var i = 0; i < data.fileLocation.length; i++) {
			var name = data.fileLocation[i].fileLocation.substr(data.fileLocation[i].fileLocation.indexOf("/") + 1);
			root += "<li>" + name + " | <a href=''>remove</a></li>"
		}
		root += "</ul></div>";
		$(".dataform").before(root);
	}

	if(data.parentId) {
		var id = data.parentId
		$("div.pId").empty().append("<a href='/overview/"+id+"' target='_blank'>"+id+"</a>");
	}
}
//fill up the fields of special input fields
function fillInSpecialDataFields(info,name,parent) {

	for(var i in info) {
		
		var spField = $(addSpecialField(name,name+parent))

		for(j in info[i]) {
			$('[name="' + j + '"]', spField).val(info[i][j]);
		}
		$.fn.reverse = [].reverse; 

		$(".dataform ul").eq(itemPos).append(spField);	

	}
	itemPos++;
}


//if you click a button in the property list
function loadPropertyActions(){
		$("#properties button").click(function(event) {
		event.preventDefault()
		if($(this).text() == "objectId" || $(this).text() == "upload"  ) {
			addProjectField($(this))
		} else {
			//optionsArray can be found in menu.js
			addInputFieldToFrom($(this).index(),optionsArray);
		}

	});

	$("#properties a").click(function(event) {event.preventDefault()})
	//when clicking a dropdown section it makes it "highlighted"
	$(".accordion-heading").click(function() {
		$(".accordion-heading").removeClass("accordion-heading-focus");
		$(this).addClass("accordion-heading-focus");
	})
}

//any navigation actions
function loadNavigationActions(){
	$(document).on("click",".breaddisabled",function(event) {
		return false;
	});

	$(document).on("click","form .breadcrumb li a", function(event) {
		$("form .breadcrumb a").parent().removeClass("active");
		$(this).parent().addClass("active");
	});
	$(".pager a").click(function() {

		$(".breadcrumb a").parent().removeClass("active");
		link = $(this).attr("href");
		$(".breadcrumb").find("a").each(function(index) {
			if($(this).attr("href") == link) {
				$(this).removeClass("breaddisabled")
				$(this).parent().addClass("active");
			}
		});
	});
	//Handles navigation in the file structure
	$(document).on("click", "form .breadcrumb li a", function(event) {
		event.preventDefault()
		//removes all the breadcrumbs after the clicked breadcrumb
		$(this).parent().nextAll().remove();
		//we don't want to load children'
		goDeeper = false;
		$(".row .breadcrumb").append("<li>")
		//triggering backbone to load the children of the selected breadcrumb
		workspace.navigate("#" + $(this).attr("href"), {
			trigger : true
		});
	});
}

function loadBtnActions(){
	loadPropertyActions();
	loadNavigationActions();
	//saving the metadata in the edit screen
	$("#editItem1,#editItem2").click(function(event) {
		event.preventDefault()
		if(window.location.pathname == "/edit") {
			var data = {
				"properties" : {},
			};
			var pos = $(".items li.accordion-heading-focus").attr('data-pos');
			$(".items li.accordion-heading-focus").removeClass("changedItem");
			data.dateModified = Date.now();
			if(editItems[pos].parentId) {
				data.parentId = editItems[pos].parentId
			}

			if(fileUploadLocation.length > 0) {
				if(editItems[pos].fileLocation) {
					data.fileLocation = editItems[pos].fileLocation
					for(var i = 0; i < fileUploadLocation.length; i++) {
						data.fileLocation.push(fileUploadLocation[i])
					}
				} else {
					data.fileLocation = fileUploadLocation;

				}
			}else {
				if(editItems[pos].fileLocation) {
					data.fileLocation = editItems[pos].fileLocation
				}
			}

			createMetaDataModels("#singleData", function(model) {
				var link = socket + driPath +"objects/" + $(".items li.accordion-heading-focus").find("a").attr("href") + "/update";
				data.properties = model
				updateData('POST', data, link, function(id) {
					$(".updatebox").fadeIn(300).delay(1500).fadeOut(400);
					fileUploadLocation = new Array();
				})
			})
		}
	})
	//adds another special field if there can be multiple example: topic
	$(document).on("click",".addInput",function(event){
		event.preventDefault();
		$(this).next().append(addSpecialField($(this).attr("data-type"),$(this).attr("data-type")));
	})
	//loads the data if you select an item in the list of the edit page (step2)
	$(document).on("click",".items ul li a", function(event) {
		$(".controls").show();
		event.preventDefault();
		$("#multi").hide();
		$("#single").show();
		var link = driPath +"objects"
		if($.browser.msie) {
			link = driPath +"objects/"
		}
		var pos = $(this).parent().attr("data-pos");
		if(editItems[pos]) {
			fillUpForm(editItems[pos]);
		}

	});


	$(document).on("click","#createCollection,#createSerie,#createItems", function(event) {
		event.preventDefault;
		$("#successbox").hide();
		emptyForm();
	});

	$(".nextItemBtn").click(function(event) {
		event.preventDefault()
		loadNexItemInList()
	})

	$(".previousItemBtn").click(function(event){
		event.preventDefault()
		loadPrevItemInList();
	})
}
//gets the next item in the list of items that needs to be edited
function loadNexItemInList() {
	$(".controls").show();
	urlNextItem = $(".items li.accordion-heading-focus").next().find("a").attr("href");
	nextItem = $(".items li.accordion-heading-focus").next();
	if(!nextItem.is("li")) {
		nextItem = $(".items li:first");
		urlNextItem = $(".items li:first").find("a").attr("href");
	}
	nextItem.siblings().removeClass("accordion-heading-focus");
	nextItem.addClass("accordion-heading-focus");
	var pos = $(nextItem).attr("data-pos");
	if(editItems[pos]) {
		fillUpForm(editItems[pos]);
	}
}
//gets the previous item in the list of items that needs to be edited
function loadPrevItemInList() {
	$(".controls").show();
	urlPrevItem = $(".items li.accordion-heading-focus").prev().find("a").attr("href");
	prevItem = $(".items li.accordion-heading-focus").prev();
	if(!prevItem.is("li")) {
		prevItem = $("#list1 li:last");
		urlPrevItem = $("#list1 li:last").find("a").attr("href");
	}

	prevItem.siblings().removeClass("accordion-heading-focus");
	prevItem.addClass("accordion-heading-focus");

	var pos = $(prevItem).attr("data-pos");
	if(editItems[pos]) {
		fillUpForm(editItems[pos]);
	}

}

function emptyForm() {
	$(".dataform").empty();
	$("#upload").remove();
	$("#boxFiles").remove();
}



var counter = 100
//creates the metadata properties in the form for the create page
function addInputFieldToFrom(index, dataObject) {
	var name = dataObject[index].name;
	var root = '<div id="' + dataObject[index].name + '"class="formInput">'
	root += '<h3>' + dataObject[index].name + '</h3>'
	root += '<a class="close" data-dismiss="alert" href="#">&times;</a><hr>'
	for(var i in dataObject[index].value) {

		root += '<div class="control-group"><label class="control-label">' + i + '</label>';
		if(checkSpecialField(i + name)) {
			root += '<a class="close" data-dismiss="alert" href="#">&times;</a>';
			root += "<div class='controls'><button class='btn addInput' data-type='" + i + name + "'>Add " + i + "</button>";
			root += '<ul data-name="' + i + '" id="ul' + counter + '">' + addSpecialField(name, i + name) + '</ul>';
		} else if(checkSingleField(i + name)) {
			root += '<div class="controls">';
			root += addSpecialField(name, i + name);
			root += '</div><a class="close specialClose" data-dismiss="alert" href="#">&times;</a></div>';
		} else {
			root += '<div class="controls"><input type="text" id="' + i + counter + '" name="' + i + '" class="input-xlarge" />';
			root += '</div><a class="close" data-dismiss="alert" href="#">&times;</a></div>';
		}
	}

	root += "</div>"
	counter++;

	$(".dataform").prepend(root);

	$(".dataform select").ufd({
		prefix : ""
	});

}
//creates the metadata properties in the form for the edit page
function addEditFormFields(dataObject, name) {
	var root = '<div id="' + name + '"class="formInput">'
	root += '<h3>' + name + '</h3>'
	root += '<a class="close" data-dismiss="alert" href="#">&times;</a><hr>'

	for(var j in optionsArray) {
		for(var i in optionsArray[j].value) {
			if(optionsArray[j].name == name) {
				root += '<div class="control-group"><label class="control-label">' + i + '</label>';
				if(checkSpecialField(i + name)) {
					root += '<a class="close" data-dismiss="alert" href="#">&times;</a>';
					root += "<div class='controls'><button class='btn addInput' data-type='" + i + name + "'>Add " + i + "</button>";
					root += '<ul data-name="' + i + '" id="ul' + counter + '">' + addSpecialField(name, i + name) + '</ul>';
				} else if(checkSingleField(i + name)) {
					root += '<div class="controls">';
					root += addSpecialField(name, i + name);
					root += '</div><a class="close specialClose" data-dismiss="alert" href="#">&times;</a></div>';
				} else {
					root += '<div class="controls"><input type="text" id="' + i + counter + '" name="' + i + '" class="input-xlarge" />';
					root += '</div><a class="close" data-dismiss="alert" href="#">&times;</a></div>';
				}
			}
		}
	}

	root += "</div>"
	counter++;

	$(".dataform").append(root);
	//create special select boxes that allow searching in it
	$(".dataform select").ufd({
		prefix : ""
	});

}

var specialFields = ["topicsubject","internetMediaTypephysicalDescription","languageTermlanguage","dateOtheroriginInfo","abstractabstract","typephysicalDescription"]
function checkSpecialField(name) {
	for(var i = 0; i < specialFields.length; i++) {
		if(name == specialFields[i]) {
			return true;
		}
	}
	return false;
}

var singleFields = ["accessConditionaccessCondition","typerelatedItem","typeidentifier","namesubject","typesubject","texttableOfContents","typetableOfContents","typenote","digitalOriginphysicalDescription","typeOfResourcetypeOfResource", "genregenre","notenote", "typetitleInfo","typename","authorityname","rolename"]
function checkSingleField(name) {

	for(var i = 0; i < singleFields.length; i++) {
		if(name == singleFields[i]) {
			return true;
		}
	}
	return false;
}
//creates the html for the special fields
function addSpecialField(name,prop) {
	counter++
	removebtn = '</div><a class="close" data-dismiss="alert" href="#">&times;</a></div>'
	switch(prop) {
		case "role":
			return "<li data-type='role'><div class='inputBox'><select class='input-small' name='role'  id='"+name+counter+"' ><option value='text'>text</option>" 
			+ "<option value='code'>code</option></select>"
			+ "<label>Authority</label><input id='"+name+counter+"a' name='authority' type='text' class='input-small'>" + removebtn + "</div></li> ";
			break;
		case "typeOfResourcetypeOfResource":
			return createSelect(resourceTypes, name);
			break;
		case "genregenre":
			return "<label>Authority</label><input  id='input"+counter+"a' name='authority' value='aat' type='text' class='input-small'><br />"
			+"<label>Genre</label>"+createSelect(genres,"genre")+"<br /><hr>";
			break
		case "place":
			return "<li><div class='inputBox'><hr><select id='input"+counter+"' class='input-small'><option value='text'>text</option>" 
			+ "<option value='code'>code</option></select>"
			+"<label>Authority</label><input id='input"+counter+"a' name='authority' type='text' class='input-small'><br>"
			+"<label>Place</label><input id='input"+counter+"b' name='place' type='text' class='input-small'>"+ removebtn + "</div></li> ";
			break;
		case "digitalOriginphysicalDescription":
			return createSelect(physicalDescriptionObjects, "digitalOrigin")
			break;
		case "internetMediaTypephysicalDescription":
		 	return "<li class='dummy'><div class='inputBox'><hr><label>Type:</label>"+createSelect(mediaTypes,"internetMediaType") + removebtn + "</div></li> ";
			break;
		case "abstractabstract":
			return "<li data-type='abstract'><div class='inputBox'>"+createSelect(abstractType,"type")
			+ "<label>abstract</label><textarea id='"+name+counter+"a' name='abstract'></textarea>" + removebtn + "</div></li> ";
			break;
		case "notenote":
			return "<textarea name='note' id='input"+counter+"'  rows='5' cols='50'></textarea>";
			break
		case "topic":
			return "<li class='dummy'><div class='inputBox'><label>Topic:</label><input id='input"+counter+"' type='text' name='topic'>" + removebtn + "</div></li> ";
			break;
		case "identifier":
			return "<li class='dummy'><div class='inputBox'><label>type</label><input id='input"+counter+"a' name='type' type='text' class='input-small'>"
			+"<label>value</label><input id='input"+counter+"' name='value' type='text' class='input-small'>" + removebtn + "</div></li> ";
			break;
		case "dateOtheroriginInfo":
			return "<li><div class='inputBox'><label>point</label>"+createSelect(dateOther,"point")+"<br />"
			+"<label>dateOther</label><input id='input"+ counter +"a' name='dateOther' type='text' class='input-small'><br />"+ removebtn + "</div></li>";
			break;
		case "languageTermlanguage":
		return "<li><div class='inputBox'><hr><select id='input"+counter+"' class='input-small' name='type'><option value='text'>text</option>" 
			+ "<option value='code'>code</option></select>"
			+"<label>Authority</label><input id='input"+counter+"a' name='authority' type='text' value='iso639-2b' class='input-small'><br>"
			+"<label>language</label>"+createSelect(languages,"language")+ removebtn + "</div></li> ";
			break;
		case "name":
			return "<li><div class='inputBox'><hr>"
			+"<label>namePart</label><input id='"+name+counter+"d' name='namePart' type='text' class='input-small'><br>"
			+"<label>displayForm</label><input id='"+name+counter+"e' name='displayForm' type='text' class='input-small'><br>"
			+"<label>affiliation</label><input id='"+name+counter+"f' name='affiliation' type='text' class='input-small'><br>"+ removebtn + "</div></li>";
			break
		case "typetitleInfo":
			return createSelect(titleType,"type")
			break 
		case "typename":
			return createSelect(nameType,"type")
			break 
		case "authorityname":
			return createSelect(nameAuth,"authority")
			break 
		case "rolename":
			return createSelect(nameRole,"role")
			break 
		case "typephysicalDescription":
			return "<li><div class='inputBox'><hr>"+createSelect(physcialDescriptionType,'type')+"<label>type</label><input name='typeDescription'type='text'>"+ removebtn +"</div></li>"
			break;
		case "typenote":
			return createSelect(noteType,'type')
			break;
		case "typetableOfContents":
			return createSelect(abstractType,'type')
			break;
		case "texttableOfContents":
			return "<textarea name='texttableOfContentsDescription' id='input"+counter+"' rows='5' cols='50'></textarea>"
			break;
		case "namesubject":
			return "<label>name</label><input id='"+name+counter+"' name='name' type='text' class='input-large'><br>"
			+"<label>type</label>"+ createSelect(nameType,"type")+"<br />"
			+"<label>authority</label>"+createSelect(nameAuth,"authority")
			+"<hr>"
			break;
		case "topicsubject":
			return "<li><div class='inputBox'><hr><label>topic</label><input id='"+name+counter+"' name='topic' type='text' class='input-large'><br>"
			+"<label>authority</label>"+createSelect(subjectAuth,"authority")
			+ removebtn + "</div></li>";
			break;
		case "typeidentifier":
			return createSelect(identifiertype,"type")
			break;
		case "typerelatedItem":
			return createSelect(relatedType,"type")
			break;
		case "accessConditionaccessCondition":
			return createSelect(accessConditions,"type")
			break;
		
	}
}

function createSelect(items, name) {
	var root = "<select class='chzn-select' name='" + name + "' id='select"+counter+"'>"
	for(var i = 0; i < items.length; i++) {
		root += "<option value="+items[i]+">" + items[i] + "</option>";
	}
	root += "</select>"
	return root;
}

//creates the json data file
function createMetaDataModels(form, callback) {
	if($(".dataform > div", form).length == 0) {
		callback({});
	}else {
		var dataBlocks = $(".dataform > div", form).not(".upload");
		Model = Backbone.Model.extend();

		var dataModel = new Model();
		var parent = new Object();
		for(var k = 0; k < dataBlocks.length; k++) {
			var b = new Object();
			if(parent[$(dataBlocks[k]).attr("id")] == undefined) {
				parent[$(dataBlocks[k]).attr("id")] = new Array();
			}

			var fields = $("input,select,textarea", dataBlocks[k]).not("ul input, ul select");

			for(var i = 0; i < fields.length; i++) {
				if($(fields[i]).val() != "") {
					b[$(fields[i]).attr("name")] = $(fields[i]).val();
				}
			}
			var lists = $("ul", dataBlocks[k])
			for(var j = 0; j < lists.length; j++) {
				var items = $("li", lists[j])
				var itemsArray = [];
				for(var i = 0; i < items.length; i++) {
					var obj = new Object();
					var selects = $("select", items[i])
					for(var l = 0; l < selects.length; l++) {
						obj[$(selects[l]).attr("name")] = $(selects[l]).val();
						obj[$(selects[l]).attr("name")] = $(selects[l]).val();
					}
					var selects = $("input,textarea", items[i])
					for(var m = 0; m < selects.length; m++) {
						obj[$(selects[m]).attr("name")] = $(selects[m]).val();
						obj[$(selects[m]).attr("name")] = $(selects[m]).val();
					}
					itemsArray.push(obj)
				}
				b[$(lists[j]).attr("data-name")] = itemsArray;
			}
			parent[$(dataBlocks[k]).attr("id")].push(b);
			dataModel.set(parent);
		}
		callback(dataModel.toJSON());
	}
}


//adds the correct fields in the form for the project properties
function addProjectField(obj) {

	if($(obj).text() == "objectId") {
		var root = '<div class="control-group"><label class="control-label">' + $(obj).text() + '</label>';
		root += '<div class="controls"><input type="text" id="' + $(obj).text() + '" name="' + $(obj).text() + '" class="input-xlarge" />';
		root += '</div><a class="close" data-dismiss="alert" href="#">&times;</a></div>';
		$(".dataform").prepend(root)

	} else if($(obj).text() == "upload") {
		//loads in the upload plugin page
		$.get("/upload.htm", function(data) {
			var upField = "<div class='formInput' id='" + $(obj).text() + "'><a class='close' data-dismiss='alert'>×</a>" + data + "</div>";
			$(".dataform").before(upField)
		})
	}

}



