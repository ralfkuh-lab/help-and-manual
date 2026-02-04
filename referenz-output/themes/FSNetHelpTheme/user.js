onload = function initialize() {
	window.nethelp.ikarosExtensions = function () {
		var ikarosExtensions = {
			fs_allChaptersInHelp: document.createElement('div'),
			fs_nodesToRemoveInLocalisedBuild: [],
			fs_translatedElements: [
			  {id:'fs-ribbonTab', translations:[
				['DE', 'IKAROS-Hilfe'], 
				['FR', 'Aide d\'IKAROS'], 
				['EN', 'IKAROS help']]}, 
			  {id:'fs-ribbonGroup-navigation', translations:[
				['DE', 'Navigation'], 
				['FR', 'Navigation'], 
				['EN', 'Navigation']]},
			  {id:'fs-ribbonGroup-actions', translations:[
				['DE', 'Drucken'], 
				['FR', 'Imprimer'], 
				['EN', 'Print']]},
			  {id:'fs-ribbonGroup-chapters', translations:[
				['DE', 'Kapitel'], 
				['FR', 'Chapitres'], 
				['EN', 'Chapters']]},
			  {id: 'fs-button-cancel-caption', translations:[
				['DE', 'Abbrechen'],
				['EN', 'Cancel'], 
				['FR', 'Annuler']]},
			   {id: 'fs-button-confirm-caption', translations:[
				['DE', 'OK'],
				['EN', 'OK'], 
				['FR', 'OK']]},
			   {id: 'fs-button-open-chapter-caption', translations:[
				['DE', 'Öffnen'],
				['EN', 'Open'], 
				['FR', 'Ouvrir']]},
			   {id: 'fs-chapter-id-input-dialog-title', translations:[
				['DE', 'Kapitel per ID öffnen'],
				['EN', 'Open chapter by ID'], 
				['FR', 'Ouvrir de chapitres par ID']]},
			   {id: 'fs-chapter-id-input-label', translations:[
				['DE', 'ID des Kapitels: '],
				['EN', 'ID of the chapter: '], 
				['FR', 'ID du chapitre: ']]},
			   {id: 'fs-chapter-id-input-tooltip', translations:[
				['DE', 'Die ID des Kapitels entspricht dem Namen der dazugehörigen HTML-Datei (ohne die Endung ".html").\r\nBeispiel: In der URL "../IkarosHelp.html#!Documents/CaseManagement/fs_49a3aca8b12b.html" ist die ID des Kapitels "fs_49a3aca8b12b".'],
				['EN', 'The ID of the chapter corresponds to the name of the corresponding HTML file (without the ending ".html").\r\nExample: In the URL "../IkarosHelp.html#!Documents/CaseManagement/fs_49a3aca8b12b.html" the ID of the chapter is "fs_49a3aca8b12b".'], 
				['FR', "L'ID du chapitre correspond au nom du fichier HTML correspondant (sans la terminaison '.html').\r\nExample : Dans l'URL '.../IkarosHelp.html#!Documents/CaseManagement/fs_49a3aca8b12b.html' est l'ID du chapitre 'fs_49a3aca8b12b'."]]},
			   {id: 'fs-message-info-title', translations:[
				['DE', 'Information'],
				['EN', 'Notification'], 
				['FR', 'Notification']]},
			   {id: 'fs-loading-subchapters-text', translations:[
				['DE', 'Lade Unterkapitel ...'],
				['EN', 'Loading subchapters ...'], 
				['FR', "Chargement de sous-chapitres ..."]]},
			   {id: 'fs-loading-help-text', translations:[
				['DE', 'Lade IKAROS-Hilfe ...'],
				['EN', 'Loading IKAROS help ...'], 
				['FR', "Chargement l'aide IKAROS ..."]]},
				{id: 'fs-toc-data-could-not-be-loaded', translations:[
				['DE', 'Die Daten für die Kapitelsuche per ID konnten nicht geladen werden. \r\nDies kann vorkommen, wenn Ihr Webbrowser momentan eine große Arbeitslast hat. Versuchen Sie, die Hilfe neu zu laden.'],
				['EN', 'The data for the chapter search by ID could not be loaded. \r\nThis can happen if your web browser currently has a heavy workload. Try reloading the help.'], 
				['FR', "Les données pour la recherche de chapitre par ID n'ont pas pu être chargées.\r\nCela peut arriver si votre navigateur web a actuellement une grande charge de travail. Essayez de recharger l'aide."]]},
			   {id: 'fs-loading-of-entire-chapter-not-allowed-on-chrome-locally', translations:[
				['DE', 'Das Laden aller Unterkapitel funktioniert nicht, wenn die Hilfedatei lokal mit dem URL-Argument "?local=true" aufgerufen wurde. Öffnen Sie die Hilfe auf dem Web-Server aus IKAROS heraus.'],
				['EN', 'Loading all subchapters does not work if the help file was called locally with the URL argument "?local=true". Open the help on the web server from within IKAROS.'], 
				['FR', "Le chargement de tous les sous-chapitres ne fonctionne pas si le fichier d'aide a été appelé localement avec l'argument URL '?local=true'. Ouvrez l'aide sur le serveur web depuis IKAROS."]]},
			  {id: 'fs-no-chapter-with-this-id-found', translations:[
				['DE', 'Mit der eingegebenen ID konnte nicht eindeutig ein Kapitel identifiziert werden.'],
				['EN', 'It was not possible to uniquely identify a chapter with the ID entered.'], 
				['FR', "Il n'a pas été possible d'identifier de façon univoque un chapitre avec l'ID entré."]
			  ]}
			],

			fs_localiseElements: function fs_localiseElements(){

				var currentLanguageVersion = ikarosExtensions.fs_getCurrentLanguage();
				var node = null;
				ikarosExtensions.fs_nodesToRemoveInLocalisedBuild.forEach(function(element) {
					if(node !== null && currentLanguageVersion === element.removeForLanguage) {
						node = document.getElementById(element.idOfNodeToRemove);
						if(node !== null) {
							node.parentNode.removeChild(node);	
						}
					}
				});
				
				ikarosExtensions.fs_translatedElements.forEach(function (element) {
				  var translation = ikarosExtensions.fs_getTranslationByLanguageCode(element.translations, currentLanguageVersion);
				  node = document.getElementById(element.id);
				  if(node !== null && translation.length > 0) {
					  node.textContent = translation;
				  }
				});
			},

			fs_collapseEntriesInTableOfContents: function fs_collapseEntriesInTableOfContents(){
				var allExpandedTocNodes = document.querySelectorAll('#c1toc .c1-toc-item-expanded');
				for(var i = 0; i < allExpandedTocNodes.length; i++) {
					var expandedNode = allExpandedTocNodes.item(i);
					var childListNodes = expandedNode.querySelectorAll('ul');

					if (expandedNode.getAttribute('class').indexOf('.ui-btn-active') === -1 && expandedNode.querySelectorAll('.ui-btn-active').length === 0)  {
						for(var n = 0; n < childListNodes.length; n++){
						  var childListNode = childListNodes.item(n);
						  var styleValue = childListNode.getAttribute('style');
						  childListNode.setAttribute('style', styleValue === null || styleValue.length === 0 ? 'display:none' : styleValue.replace(/display:.*block;/, 'display:none'));       
						}
						expandedNode.setAttribute('class', expandedNode.getAttribute('class').replace('c1-toc-item-expanded', 'c1-toc-item-collapsed'));
						var iconNode = expandedNode.querySelector('.ui-icon-folder-open');
						iconNode.setAttribute('class', iconNode.getAttribute('class').replace(/ui-icon-folder-open/, 'ui-icon-folder-collapsed'));
					}
				}
			},

			fs_openChapterById: function fs_openChapterById(idToSearch) {
				if (idToSearch !== null) {
					var chapterPath = ikarosExtensions.fs_getTocItemByChapterId(idToSearch);
					if (chapterPath !== null) {
						window.location.hash = '#!' + chapterPath.getAttribute('url');
					} else {
						ikarosExtensions.fs_showMessage(ikarosExtensions.fs_getTranslation('fs-no-chapter-with-this-id-found', ikarosExtensions.fs_getCurrentLanguage()));
					}
				}
			},

			fs_getTocItemByChapterId: function fs_getTocItemByChapterId(idOfChapter){
				var foundChapters = null;
				if (idOfChapter !== null) {
					foundChapters = ikarosExtensions.fs_allChaptersInHelp.querySelectorAll('item[url*="' + idOfChapter.toLowerCase() + '"]');
					return foundChapters.length !== 1 ? null : foundChapters.item(0);
				} else {
					return null;
				}
			},

			fs_getTranslationsForId: function fs_getTranslationsForId(id) {
				var translations = ikarosExtensions.fs_translatedElements.filter(function(x) {return x.id === id});
				return translations !== null ?  translations[0].translations : null;
			},

			fs_showChapterIdSearchDialog: function fs_showChapterIdSearchDialog() {
				ikarosExtensions.fs_createChapterIdInputDialog();
			},

			fs_getCurrentLanguage: function fs_getCurrentLanguage(){
				return document.location.pathname.replace(/.*\/(DE|FR|EN)\/(Ikaros){0,1}Help.html.*/i, '$1');
			},

			fs_getTranslation: function fs_getTranslation(id){
				return ikarosExtensions.fs_getTranslationByLanguageCode(ikarosExtensions.fs_getTranslationsForId(id), ikarosExtensions.fs_getCurrentLanguage());
			}, 

			fs_getTranslationByLanguageCode: function fs_getTranslationByLanguageCode(translations, languageCode) {
				languageCode = languageCode.length === 2 ? languageCode : 'EN';
				var translation = translations.filter(function (item) {
					return item[0].toLowerCase() === languageCode.toLowerCase();
				});
				return translation.length > 0 ? translation[0][1] : '';
			},

			fs_loadFileContentIntoNode: function fs_loadFileContentIntoNode(filePath, targetNode, callbackFunction, documentNodeTag) {
				var ajaxObject = window.nethelp.dataProviders.xml.load(filePath, waitForResponseText);
				
				function waitForResponseText() {
					if (ajaxObject.responseText !== null && ajaxObject.responseText !== undefined && ajaxObject.responseText.length > 0) {
						var responseText = ajaxObject.responseText;
						responseText = responseText.substring(responseText.indexOf(typeof documentNodeTag === 'string' && documentNodeTag.length > 0 ? '<' + documentNodeTag : -1));
						responseText = responseText.replace('/' + documentNodeTag + '>', '/div>').replace('<' + documentNodeTag, '<div class="documentContentNode"');
						responseText = responseText.replace(/(\.\.\/)*(ImagesExt)/gi, '$2');
						targetNode.innerHTML = responseText;
						if(callbackFunction !== null && callbackFunction !== undefined && typeof callbackFunction === 'function') {
							callbackFunction(targetNode);
						}
						return targetNode;
					} else {
						ikarosExtensions.fs_showMessage(ikarosExtensions.fs_getTranslation('fs-toc-data-could-not-be-loaded', ikarosExtensions.fs_getCurrentLanguage()));
					}
				}
			},

			fs_createChapterIdInputDialog: function fs_createChapterIdInputDialog() {
				var dialog = document.createElement('div');
				var fldInput = document.createElement('input');
				var lblInputFieldLabel = document.createElement('label');
				var btnConfirm = document.createElement('input');
				var btnCancel = document.createElement('input');
				var frmControls = document.createElement('form');
				var dialogTitle = document.createElement('div');
				var dialogFrame = document.createElement('div');
				var buttonFrame = document.createElement('div');
				
				dialog.setAttribute('id', 'fs-chapter-id-input-dialog');
				fldInput.setAttribute('id', 'fs-chapter-id-input');
				lblInputFieldLabel.setAttribute('id', 'fs-chapter-id-input-label');
				btnConfirm.setAttribute('id', 'fs-chapter-id-confirm-button');
				btnCancel.setAttribute('id', 'fs-chapter-id-cancel-button');
				frmControls.setAttribute('id', 'fs-chapter-id-controls-form');
				dialogTitle.setAttribute('id', 'fs-chapter-id-input-dialog-title');
				dialogFrame.setAttribute('id', 'fs-chapter-id-input-dialog-frame');
				buttonFrame.setAttribute('id', 'fs-chapter-id-input-buttons-frame');
				
				fldInput.setAttribute('type', 'text');
				fldInput.setAttribute('name', 'fs-chapter-id-input');
				fldInput.setAttribute('value', ikarosExtensions.fs_getChapterIdFromUrl(document.location.toString()) || 'fs_052273a8d625');
				fldInput.setAttribute('maxlength', '15');
				fldInput.setAttribute('title', ikarosExtensions.fs_getTranslation('fs-chapter-id-input-tooltip'));
				
				lblInputFieldLabel.textContent = ikarosExtensions.fs_getTranslation('fs-chapter-id-input-label');
				dialogTitle.textContent = ikarosExtensions.fs_getTranslation('fs-chapter-id-input-dialog-title');
				
				btnConfirm.setAttribute('type', 'button');
				btnConfirm.setAttribute('name', 'fs-chapter-id-confirm-button');
				btnConfirm.setAttribute('value', ikarosExtensions.fs_getTranslation('fs-button-open-chapter-caption'));
				btnConfirm.onclick = function() {ikarosExtensions.fs_openChapterById(document.getElementById('fs-chapter-id-input').value); ikarosExtensions.fs_removeNodeById('fs-chapter-id-input-dialog');};
				
				btnCancel.setAttribute('type', 'button');
				btnCancel.setAttribute('name', 'fs-chapter-id-cancel-button');
				btnCancel.setAttribute('value', ikarosExtensions.fs_getTranslation('fs-button-cancel-caption'));
				btnCancel.onclick = function() {ikarosExtensions.fs_removeNodeById('fs-chapter-id-input-dialog');};
				
				dialogFrame.appendChild(dialogTitle);
				frmControls.appendChild(lblInputFieldLabel);
				frmControls.appendChild(fldInput);
				buttonFrame.appendChild(btnConfirm);
				buttonFrame.appendChild(btnCancel);
				frmControls.appendChild(buttonFrame);
				dialogFrame.appendChild(frmControls);
				dialog.appendChild(dialogFrame);
				document.body.insertBefore(dialog, document.body.firstChild);
				fldInput.focus();
				fldInput.setSelectionRange(0, 15);
				dialog.onkeydown = fs_handleOnKeyDownInInputDialog;

				function fs_handleOnKeyDownInInputDialog(e) {
					var activeElementId = document.activeElement.getAttribute('id');
					if ((e.keyCode === 13 || e.keyCode === 176) && activeElementId !== 'fs-chapter-id-cancel-button') {
							e.preventDefault(); e.stopPropagation();
							ikarosExtensions.fs_openChapterById(document.getElementById('fs-chapter-id-input').value);
							ikarosExtensions.fs_removeNodeById('fs-chapter-id-input-dialog');
					} else if (e.keyCode === 9) {
						if (activeElementId === 'fs-chapter-id-input' && e.shiftKey) {
							document.getElementById('fs-chapter-id-cancel-button').focus();
							e.preventDefault();
							e.preventPropagation();
						} else if (activeElementId === 'fs-chapter-id-cancel-button' && !e.shiftKey) {
							document.getElementById('fs-chapter-id-input').focus();
							e.preventDefault();
							e.preventPropagation();
						}
					} else if(e.keyCode === 27 || ((e.keyCode === 13 || e.keyCode === 176) && activeElementId === 'fs-chapter-id-cancel-button')) {
						e.preventDefault();
						e.stopPropagation();
						ikarosExtensions.fs_removeNodeById('fs-chapter-id-input-dialog');
					}
				}
			},

			fs_showMessage: function fs_showMessage(messageText){
				var dialog = document.createElement('div');
				var dialogFrame = document.createElement('div');
				var messageNode = document.createElement('div');
				var btnConfirm = document.createElement('input');
				var dialogTitle = document.createElement('div');
				
				dialog.setAttribute('id', 'fs-message-dialog');
				dialogFrame.setAttribute('id', 'fs-message-dialog-frame');
				messageNode.setAttribute('id', 'fs-message-dialog-message-node');
				btnConfirm.setAttribute('id', 'fs-message-dialog-confirm-button');
				dialogTitle.setAttribute('id', 'fs-message-dialog-title');
				
				dialogTitle.textContent = ikarosExtensions.fs_getTranslation('fs-message-info-title');
				btnConfirm.setAttribute('value', ikarosExtensions.fs_getTranslation('fs-button-confirm-caption'));
				btnConfirm.setAttribute('type', 'button');
				btnConfirm.onclick = function(){ikarosExtensions.fs_removeNodeById('fs-message-dialog');};
				
				messageNode.textContent = messageText;
				
				dialogFrame.appendChild(dialogTitle);
				dialogFrame.appendChild(messageNode);
				dialogFrame.appendChild(btnConfirm);
				dialog.appendChild(dialogFrame);
				document.body.insertBefore(dialog, document.body.firstChild);
				document.onkeydown = function(e) {
					var x = [9, 13, 27, 32, 176];
					if (x.some(function(y) {return e.keyCode === y;})){
						e.preventDefault();
						e.stopPropagation();
						ikarosExtensions.fs_removeNodeById('fs-message-dialog');
						document.onkeydown = null;
					}
				}
			},

			fs_removeNodeById: function fs_removeNodeById(id) {
				if(id !== undefined && id !== null && typeof id === 'string' && id.length > 0) {
					var x = document.getElementById(id);
					if (x !== null) {
						x.parentNode.removeChild(x);
					}
				}
			},

			fs_getChapterIdFromUrl: function fs_getChapterIdFromUrl(url){
				if(typeof url === 'string') {
					url = url.toLowerCase();
					var chapterId = url.match(/fs_[a-z0-9]{12}/);
					return chapterId !== null ? chapterId[0] : null;
				}
				return null;
			},

			fs_customIndexEntrySearchFunction: function fs_customIndexEntrySearchFunction(n, r, u) {
			  //overwrites the function "window.nethelp.index.Data.prototype._filter" in file "nethelp.js" for improved index search
			  u = u || 0;
			  var t = nethelp;
			  var o = this;
			  var e = !t.isString(r);
			  var f = r && (e ? r[u] : r);
			  var resultObject = {};
			  return f ? (n = t.map(n, function (n) {
				var searchTerms = f.split(' ').filter(function(i){return i.trim().length > 0});
				resultObject.text = n.text;
				if (n.items !== undefined && n.items.length > 0) {
					if (fs_containsAllSearchTerms(o._key(n), searchTerms)) {
						resultObject.items = n.items;
						resultObject.mainEntryHasMatch = true;
					} else {
						resultObject.items = n.items.filter(function(item){return fs_containsAllSearchTerms(o._key(n) + ' ' + item.text.toLowerCase(), searchTerms)});
						resultObject.items = resultObject.items.length > 0 ? resultObject.items : undefined;
						resultObject.mainEntryHasMatch = false;
					}
				} else {
					resultObject.items = undefined;
				}
				resultObject.links = n.links;
			  
				var found = fs_containsAllSearchTerms(o._key(n), searchTerms) || resultObject.items !== undefined;
				n = found ? resultObject : n;
				return found ? t.extend({
				}, n)  : undefined
			  }), e && t.each(n, function (n, t) {
				t = n.items,
				t && t.length && (n.items = o._filter(t, r, u + 1))
			  }), n.length ? n : undefined)  : t.extend(!0, [
			  ], n)

				function fs_containsAllSearchTerms(textToCheck, searchTermsArray) {
					return searchTermsArray.filter(function(i) {return textToCheck.toLowerCase().indexOf(i) >= 0}).length === searchTermsArray.length;
				}
			},

			fs_loadAllSubchaptersOfCurrentChapter: function fs_loadAllSubchaptersOfCurrentChapter() {
				setTimeout(function() {
					fs_setDisplayStateOfLoadingSpinner(true, 'fs-loading-subchapters-text');
				}, 1);
				setTimeout(function() {
					fs_loadAllSubchapters(ikarosExtensions.fs_getChapterIdFromUrl(window.location.hash));
				}, 10);

				function fs_loadAllSubchapters(idOfMainChapter){
					
					if (window.location.toString().indexOf('local=true') >=0) {
						ikarosExtensions.fs_showMessage(ikarosExtensions.fs_getTranslation('fs-loading-of-entire-chapter-not-allowed-on-chrome-locally'));
						fs_setDisplayStateOfLoadingSpinner(false, 'fs-loading-help-text');
						return null;
					} else if (!idOfMainChapter || document.getElementById('fs_appendedSubchaptersNode') !== null){
						fs_setDisplayStateOfLoadingSpinner(false, 'fs-loading-help-text');
						return null;
					}
					
					var subchaptersNode = document.createElement('div');
					var mainTopicNode = document.getElementById('c1topic');
					var separateHelpWindowId = new Date().getTime().toString();
					var subchapters = fs_getAllSubchapters(idOfMainChapter);
					var totalNumberOfSubchapters = subchapters !== null ? subchapters.length : 0;
					subchaptersNode.setAttribute('id', 'fs_appendedSubchaptersNode');
					
					fs_setDisplayStateOfLoadingSpinner(true, 'fs-loading-subchapters-text', ' (' + totalNumberOfSubchapters + ')');
					fs_deleteRelatedTopicsNode(mainTopicNode);
					fs_adjustTopicHyperlinkPaths(mainTopicNode, separateHelpWindowId);
					mainTopicNode.querySelector('.MsoTitle, .Uebertitel, h1, h2, h3, h4, h5').textContent += ' (' + ikarosExtensions.fs_getChapterIdFromUrl(window.location.hash) + ')';
					document.getElementById('c1topic').appendChild(subchaptersNode);
					
					if (subchapters !== null && totalNumberOfSubchapters > 0) {
						for(var i = 0; i < totalNumberOfSubchapters; i++) {
							var subchapterPath = subchapters.item(i).getAttribute('url');
							var subchapterNode = document.createElement('div');
							subchapterNode.setAttribute('id', ikarosExtensions.fs_getChapterIdFromUrl(subchapterPath));
							subchaptersNode.appendChild(subchapterNode);
							fs_loadChapterFile(subchapterPath, subchapterNode, separateHelpWindowId, i, totalNumberOfSubchapters);
						}
					} else {
						fs_setDisplayStateOfLoadingSpinner(false, 'fs-loading-help-text');
					}
				}

				function fs_getAllSubchapters(idOfMainChapter){
					var chapterNode = ikarosExtensions.fs_getTocItemByChapterId(idOfMainChapter);
					var allSubchapters = null;
					if (chapterNode !== null) {
						allSubchapters = chapterNode.getElementsByTagName('item');
					}
					return allSubchapters;
				}

				function fs_loadChapterFile(filePath, chapterContentNode, separateHelpWindowId, numberOfSubChapter, totalNumberOfSubChapters) {
					ikarosExtensions.fs_loadFileContentIntoNode(filePath, chapterContentNode, fs_loadChapterContentIntoNode, 'body');
					function fs_loadChapterContentIntoNode(chapterNode) {
							fs_setDisplayStateOfLoadingSpinner(undefined, 'fs-loading-subchapters-text', ' (' + numberOfSubChapter + '/' + totalNumberOfSubChapters + ')');
							var bodyNode = chapterNode.querySelector('div.documentContentNode');
							chapterNode.parentNode.replaceChild(bodyNode, chapterNode);
							var subchapterId = ikarosExtensions.fs_getChapterIdFromUrl(filePath);
							var isLastChapter = numberOfSubChapter + 1 === totalNumberOfSubChapters;
							bodyNode.setAttribute('id', subchapterId);
							bodyNode.setAttribute('style', 'margin-top: 1em; border-top: 2px dashed black;');
							fs_adjustTopicHyperlinkPaths(bodyNode, separateHelpWindowId);
							fs_deleteRelatedTopicsNode(bodyNode);
							
							var hyperlink = document.createElement('a');
							hyperlink.setAttribute('href', filePath);
							hyperlink.textContent = bodyNode.firstElementChild.textContent + ' (' + subchapterId + ')';
							bodyNode.firstElementChild.textContent = '';
							bodyNode.firstElementChild.appendChild(hyperlink);
						setTimeout(function(){
							if (bodyNode.children.length > 4 && !isLastChapter) {
								bodyNode.setAttribute('style', bodyNode.getAttribute('style') + ' page-break-after: always;');
							}
							if (isLastChapter) {
								fs_setDisplayStateOfLoadingSpinner(false, 'fs-loading-help-text');
							}
						}, 1);
					}
				}

				function fs_deleteRelatedTopicsNode(chapterNode) {
					var relatedTopicsHeader = chapterNode.querySelector('div.related-topics-header');
					relatedTopicsHeader !== null ? relatedTopicsHeader.parentNode.removeChild(relatedTopicsHeader) : '';
				}

				function fs_correctImagesPaths(targetDocument) {
					var imageNodes = targetDocument.getElementsByTagName('img');
						for(var n = 0; n < imageNodes.length; n++){
						var imageNode = imageNodes.item(n);
						imageNode.setAttribute('src', imageNode.getAttribute('src').replace(/\.\.\//gi, ''));
					}
				}

				function fs_adjustTopicHyperlinkPaths(targetDocument, separateHelpWindowId) {
					var hyperlinkNodes = targetDocument.querySelectorAll('a.topic-link');
						for(var n = 0; n < hyperlinkNodes.length; n++){
							var hyperlinkNode = hyperlinkNodes.item(n);
							var refLink = hyperlinkNode.getAttribute('href');
							var chapterId = ikarosExtensions.fs_getChapterIdFromUrl(refLink);
							var chapterTocItem = ikarosExtensions.fs_getTocItemByChapterId(chapterId)
							if (chapterTocItem !== null) {
								var newLinkNode = document.createElement('span');
								refLink = chapterTocItem.getAttribute('url');
								hyperlinkNode.textContent = '[>> ' + chapterId + ']';
								newLinkNode.setAttribute('href', refLink);
								newLinkNode.setAttribute('class', 'fs-open-in-new-window topic-link');
								newLinkNode.setAttribute('target', separateHelpWindowId);
								newLinkNode.title = hyperlinkNode.title;
								newLinkNode.textContent = hyperlinkNode.textContent;
								hyperlinkNode.parentNode.replaceChild(newLinkNode, hyperlinkNode);
								newLinkNode.setAttribute('onclick', 'javascript:window.nethelp.ikarosExtensions.fs_openHyperlinkInNewTab(event)');
							} else {
								hyperlinkNode.parentNode.removeChild(hyperlinkNode);
							}
						}
				}
				
				function fs_setDisplayStateOfLoadingSpinner(visible, spinnerTextKey, progressUpdateText) {
					var loadingSpinner = document.getElementById('c1topicSpinner');
					var loadingSpinnerImageNode = document.getElementById('c1topicSpinnerImage');
					if (visible !== undefined) {
						loadingSpinner.setAttribute('style', loadingSpinner.getAttribute('style').replace('display: ' + (visible ? 'none' : 'block') + ';', 'display: ' + (visible ? 'block' : 'none') + ';'));	
					}
					loadingSpinnerImageNode.setAttribute('src', loadingSpinnerImageNode.getAttribute('src'));
					loadingSpinner.querySelector('#c1topicSpinnerText').textContent = ikarosExtensions.fs_getTranslation(spinnerTextKey) + (progressUpdateText || '');
				}
			},

			fs_openHyperlinkInNewTab: function fs_openHyperlinkInNewTab(event) {
				var hyperlink = event.target;
				var hyperlinkHref = hyperlink.getAttribute('href');
				var newWindow = window.open('', hyperlink.getAttribute('target'));
				if (newWindow.location.toString() === 'about:blank' || newWindow.location.href.indexOf('IkarosHelp.html') < 0 || newWindow === window){
					newWindow.location.href = hyperlinkHref;
				} else {
					newWindow.location.hash = '!' + hyperlinkHref.substring(hyperlinkHref.indexOf('#!Documents/') + 1);
				}
			},
			
			fs_jumpToNextSearchHighlight: function fs_jumpToNextSearchHighlight() {
				var highlightButton = document.getElementById('c1searchButtonHighlight');
				if (window.getComputedStyle(highlightButton).getPropertyValue('opacity') !== '1') {
					highlightButton.click();
				};
				var highlightedElement = document.querySelector(".search-highlight:not(.visited-search-highlight)");
				if (highlightedElement) {
					highlightedElement.scrollIntoView();
					highlightedElement.classList.add('visited-search-highlight');
				}
			},

			fs_jumpToPreviousSearchHighlight: function fs_jumpToPreviousSearchHighlight() {
				var highlightButton = document.getElementById('c1searchButtonHighlight');
				if (window.getComputedStyle(highlightButton).getPropertyValue('opacity') !== '1') {
					highlightButton.click();
				};
				var highlightedElements = document.querySelectorAll('.search-highlight.visited-search-highlight');
				if (highlightedElements.length > 0) {
					var lastSearchHighlight = highlightedElements[highlightedElements.length - 1];
					lastSearchHighlight.classList.remove('visited-search-highlight');
					lastSearchHighlight.scrollIntoView();
				}
			}
		};
		return ikarosExtensions;
	}();
	window.nethelp.ikarosExtensions.fs_allChaptersInHelp.setAttribute('id', 'fs_allChaptersInHelp');
	window.nethelp.ikarosExtensions.fs_loadFileContentIntoNode('toc.xml', window.nethelp.ikarosExtensions.fs_allChaptersInHelp, undefined, 'toc');
	window.nethelp.ikarosExtensions.fs_localiseElements();
	window.nethelp.index.Data.prototype._filter = window.nethelp.ikarosExtensions.fs_customIndexEntrySearchFunction;
	window.document.body.onunload = function(){document.getElementById('c1indexFilter').value = '';};
}