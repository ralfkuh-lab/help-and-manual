/**
 * Shell.js - Modern Help Shell for H&M WebHelp Export
 * Features: TOC (Hilfe), Schlagwortsuche, Volltextsuche
 */

(function() {
    'use strict';

    // ============================================
    // i18n - Language detection & translations
    // ============================================

    var LANG = (function() {
        var href = window.location.href.toUpperCase();
        if (href.indexOf('/EN/') !== -1) return 'en';
        return 'de';
    })();

    var STRINGS = {
        // Page titles
        pageTitle:            { de: 'TRMS Hilfe', en: 'TRMS Help' },
        pageTitleSuffix:      { de: ' - TRMS Hilfe', en: ' - TRMS Help' },

        // Button labels (HTML with <br/>)
        btnPrev:              { de: 'Vorheriges<br/>Kapitel', en: 'Previous<br/>Chapter' },
        btnNext:              { de: 'N\u00e4chstes<br/>Kapitel', en: 'Next<br/>Chapter' },
        btnHome:              { de: 'Zur<br/>Startseite', en: 'Go to<br/>Home' },
        btnGoto:              { de: 'Kapitel per<br/>ID \u00f6ffnen', en: 'Open Chapter<br/>by ID' },
        btnCollapse:          { de: 'Baumansicht<br/>aufr\u00e4umen', en: 'Collapse<br/>Tree View' },
        btnLoadSub:           { de: 'Unterkapitel<br/>laden', en: 'Load<br/>Subchapters' },
        btnPrint:             { de: 'Drucken', en: 'Print' },

        // Button tooltips
        tipPrev:              { de: 'Vorheriges Kapitel', en: 'Previous Chapter' },
        tipNext:              { de: 'N\u00e4chstes Kapitel', en: 'Next Chapter' },
        tipHome:              { de: 'Zur Startseite', en: 'Go to Home Page' },
        tipGoto:              { de: 'Kapitel per ID \u00f6ffnen', en: 'Open Chapter by ID' },
        tipCollapse:          { de: 'Baumansicht aufr\u00e4umen', en: 'Collapse Tree View' },
        tipLoadSub:           { de: 'Unterkapitel laden', en: 'Load Subchapters' },
        tipPrint:             { de: 'Drucken', en: 'Print' },
        tipSearch:            { de: 'Suchen', en: 'Search' },
        tipSearchHelp:        { de: 'Suchhilfe', en: 'Search Help' },
        tipHighlight:         { de: 'Treffer hervorheben', en: 'Highlight Matches' },
        tipPrevMatch:         { de: 'Vorheriger Treffer', en: 'Previous Match' },
        tipNextMatch:         { de: 'N\u00e4chster Treffer', en: 'Next Match' },

        // Toolbar group labels
        labelNavigation:      { de: 'Navigation', en: 'Navigation' },
        labelChapters:        { de: 'Kapitel', en: 'Chapters' },
        labelPrint:           { de: 'Drucken', en: 'Print' },

        // Accordion tab labels
        tabHelp:              { de: 'Hilfe', en: 'Help' },
        tabKeywords:          { de: 'Schlagwortsuche', en: 'Keyword Search' },
        tabFulltext:          { de: 'Volltextsuche', en: 'Full-Text Search' },

        // Input placeholders
        placeholderKeywords:  { de: 'Schlagwort filtern...', en: 'Filter keywords...' },
        placeholderSearch:    { de: 'Suchbegriff eingeben...', en: 'Enter search term...' },

        // Search help (full HTML block)
        searchHelpHtml: {
            de: '<p>Standard-Suchmethode: Wort-exakt.</p>' +
                '<p><strong>Tipp1</strong>: Setzen Sie ein Sternchen &quot;*&quot; vor und/oder hinter den Suchbegriff, um mehr zu finden.</p>' +
                '<p><strong>Tipp2</strong>: Sie k\u00f6nnen auch logische Operatoren verwenden: AND, OR, NOT.<br/>' +
                'Beispiel: Gl\u00e4ubiger OR Rechtsanwalt AND Kosten NOT Vertrag.</p>' +
                '<p><strong>Hinweis1</strong>: Leerzeichen werden als AND behandelt.</p>' +
                '<p><strong>Hinweis2</strong>: Einige Zeichen wie der Punkt werden bei der Suche ignoriert und daher automatisch aus dem Suchausdruck entfernt.</p>',
            en: '<p>Default search method: exact word match.</p>' +
                '<p><strong>Tip 1</strong>: Use an asterisk &quot;*&quot; before and/or after the search term to find more results.</p>' +
                '<p><strong>Tip 2</strong>: You can also use logical operators: AND, OR, NOT.<br/>' +
                'Example: creditor OR lawyer AND costs NOT contract.</p>' +
                '<p><strong>Note 1</strong>: Spaces are treated as AND.</p>' +
                '<p><strong>Note 2</strong>: Some characters like the period are ignored during search and are automatically removed from the search expression.</p>'
        },

        // Search messages
        searchHint:           { de: 'Bitte Suchbegriff eingeben.', en: 'Please enter a search term.' },
        searchNoData:         { de: 'Suchdaten nicht verfuegbar.', en: 'Search data not available.' },
        searchNoResults:      { de: 'Keine Ergebnisse fuer "{query}"', en: 'No results for "{query}"' },
        searchCount:          { de: '{count} Kapitel gefunden.', en: '{count} chapters found.' },

        // Goto dialog
        gotoTitle:            { de: 'Kapitel per ID \u00f6ffnen', en: 'Open Chapter by ID' },
        gotoLabel:            { de: 'ID des Kapitels:', en: 'Chapter ID:' },
        gotoOk:               { de: '\u00d6ffnen', en: 'Open' },
        gotoCancel:           { de: 'Abbrechen', en: 'Cancel' },

        // Alert messages
        alertNotFound:        { de: 'Topic "{id}" nicht gefunden.', en: 'Topic "{id}" not found.' },
        alertNoChapter:       { de: 'Aktuelles Kapitel nicht gefunden.', en: 'Current chapter not found.' },
        alertNoSubchapters:   { de: 'Keine Unterkapitel vorhanden.', en: 'No subchapters available.' },

        // Loading/progress
        loading:              { de: 'Laden...', en: 'Loading...' },
        loadingChapters:      { de: 'Lade Kapitel...', en: 'Loading chapters...' },
        loadingProgress:      { de: 'Lade Kapitel {current} von {total}...', en: 'Loading chapter {current} of {total}...' },

        // Error messages
        errorLoadTitle:       { de: 'Fehler beim Laden', en: 'Loading Error' },
        errorLoadText:        { de: 'Die Seite "{url}" konnte nicht geladen werden.', en: 'The page "{url}" could not be loaded.' },

        // Section headers
        relatedTopics:        { de: 'Themen:', en: 'Topics:' },

        // Breadcrumb separator
        breadcrumbSep:        { de: '/', en: '/' }
    };

    /**
     * Get translated string with optional placeholder substitution.
     * Usage: t('key') or t('key', { count: 5, query: 'test' })
     */
    function t(key, vars) {
        var entry = STRINGS[key];
        if (!entry) return '[' + key + ']';
        var str = entry[LANG] || entry['de'] || '';
        if (vars) {
            for (var k in vars) {
                if (vars.hasOwnProperty(k)) {
                    str = str.replace(new RegExp('\\{' + k + '\\}', 'g'), vars[k]);
                }
            }
        }
        return str;
    }

    /**
     * Apply translations to all HTML elements with data-i18n attributes.
     * Called once at initialization.
     */
    function applyTranslations() {
        document.title = t('pageTitle');
        document.documentElement.lang = LANG;
        document.documentElement.style.setProperty('--loading-text', '"' + t('loading') + '"');

        $('[data-i18n]').each(function() {
            $(this).html(t($(this).data('i18n')));
        });
        $('[data-i18n-title]').each(function() {
            $(this).attr('title', t($(this).data('i18n-title')));
        });
        $('[data-i18n-placeholder]').each(function() {
            $(this).attr('placeholder', t($(this).data('i18n-placeholder')));
        });
    }

    // Global state
    let tocData = null;
    let keywordsData = null;
    let flatToc = [];  // Flattened TOC for prev/next navigation
    let currentTopic = null;

    // ============================================
    // TOC (Hilfe) - hmLoadTOC callback
    // ============================================

    /**
     * Called by hmcontent.js with TOC data
     */
    window.hmLoadTOC = function(data) {
        tocData = data.items;
        flattenToc(tocData);
        initShell();
    };

    /**
     * Flatten TOC tree for sequential navigation
     */
    function flattenToc(items) {
        items.forEach(function(item) {
            if (item.hf) {
                // Level-Information mit aufnehmen
                flatToc.push({
                    hf: item.hf,
                    cp: item.cp,
                    lv: item.lv
                });
            }
            if (item.items && item.items.length > 0) {
                flattenToc(item.items);
            }
        });
    }

    /**
     * Escape HTML special characters to prevent XSS
     */
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ============================================
    // Schlagwortsuche - hmLoadIndex callback
    // ============================================

    /**
     * Called by hmkwindex.js with keyword index data
     */
    window.hmLoadIndex = function(data) {
        keywordsData = data.keywords;
        buildKeywordsTree(keywordsData, $('#keywords-container'));
        initKeywordsFilter();
        updateKeywordsCount();
    };

    /**
     * Update keywords count display (counts all items including sub-items)
     */
    function updateKeywordsCount() {
        function countAll(items) {
            if (!items) return 0;
            let total = items.length;
            items.forEach(function(item) {
                if (item.subkw && item.subkw.length > 0) {
                    total += countAll(item.subkw);
                }
            });
            return total;
        }
        const count = keywordsData ? countAll(keywordsData) : 0;
        $('#keywords-count').text('(' + count + ')');
    };

    /**
     * Build keywords tree as nested ul/li
     */
    function buildKeywordsTree(items, container) {
        if (!items || items.length === 0) return;

        const ul = $('<ul class="keywords-list"></ul>');

        items.forEach(function(item) {
            const li = $('<li class="keywords-item"></li>');
            const hasChildren = item.subkw && item.subkw.length > 0;
            const hasLinks = item.hrefs && item.hrefs.length > 0;

            if (hasChildren) {
                li.addClass('has-children expanded');  // immer aufgeklappt
            }

            // Keyword wrapper
            const wrapper = $('<div class="keywords-wrapper"></div>');

            // Keyword text/link
            if (hasLinks) {
                // Clickable keyword with link(s)
                const link = $('<a class="keywords-link"></a>');
                link.text(item.kw);
                link.attr('href', '#' + item.hrefs[0]);
                link.attr('title', item.captions[0] || '');
                link.on('click', function(e) {
                    e.preventDefault();
                    loadTopic(item.hrefs[0]);
                    if ($(window).width() < 768) {
                        $('#sidebar').removeClass('open');
                    }
                });
                wrapper.append(link);

                // Multiple links indicator
                if (item.hrefs.length > 1) {
                    const more = $('<span class="keywords-more">(' + item.hrefs.length + ')</span>');
                    wrapper.append(more);
                }
            } else {
                // Non-clickable keyword (category)
                const text = $('<span class="keywords-text"></span>');
                text.text(item.kw);
                wrapper.append(text);
            }

            li.append(wrapper);

            // Build children (always visible, no toggle)
            if (hasChildren) {
                const childContainer = $('<div class="keywords-children"></div>');
                buildKeywordsTree(item.subkw, childContainer);
                li.append(childContainer);
            }

            ul.append(li);
        });

        container.append(ul);
    }

    /**
     * Initialize keywords filter
     */
    function initKeywordsFilter() {
        $('#keywords-input').on('input', function() {
            const filter = $(this).val().toLowerCase().trim();
            filterKeywords(filter);
        });
    }

    /**
     * Filter keywords by search term
     */
    function filterKeywords(filter) {
        if (!filter) {
            // Show all
            $('.keywords-item').show();
            $('#keywords-count').text('(' + $('.keywords-item').length + ')');
            return;
        }

        // 1. Alle verstecken
        $('.keywords-item').hide();

        // 2. Treffer finden, mit Nachfahren und Vorfahren anzeigen
        $('.keywords-item').each(function() {
            const $item = $(this);
            const text = $item.find('> .keywords-wrapper').text().toLowerCase();
            if (text.includes(filter)) {
                // Treffer + alle Nachfahren anzeigen
                $item.show();
                $item.find('.keywords-item').show();
                // Alle Vorfahren anzeigen
                $item.parents('.keywords-item').show();
            }
        });

        // 3. Count aktualisieren
        $('#keywords-count').text('(' + $('.keywords-item:visible').length + ')');
    }

    // ============================================
    // Volltextsuche - uses dictwords from zoom_index.js + pagedata
    // ============================================

    let lastSearchWords = [];
    let highlightActive = false;
    let currentHighlightIndex = -1;

    /**
     * Initialize fulltext search
     */
    function initFulltextSearch() {
        $('#search-button').on('click', function() {
            performSearch();
        });

        $('#search-input').on('keypress', function(e) {
            if (e.which === 13) {
                performSearch();
            }
        });

        // Hilfe-Button: toggle help text
        $('#search-help-button').on('click', function() {
            $('#search-help-text').toggle();
            $(this).toggleClass('active');
        });

        // Highlight-Button: toggle highlighting
        $('#search-highlight-button').on('click', function() {
            if (highlightActive) {
                removeHighlights();
                $(this).removeClass('active');
            } else {
                highlightSearchTerms();
                $(this).addClass('active');
            }
        });

        // Prev/Next highlight buttons
        $('#search-prev-button').on('click', function() {
            jumpToHighlight('prev');
        });
        $('#search-next-button').on('click', function() {
            jumpToHighlight('next');
        });
    }

    /**
     * Parse search query into structured terms with operators
     * Supports: quoted phrases, AND/OR/NOT operators, * wildcards
     */
    function parseSearchQuery(query) {
        var terms = [];
        // 1. Quoted phrases extrahieren: "wort1 wort2"
        var remaining = query.replace(/"([^"]+)"/g, function(m, phrase) {
            terms.push({ word: phrase.trim().toLowerCase(), op: 'AND', phrase: true });
            return '';
        });
        // 2. Restliche Tokens splitten
        var tokens = remaining.trim().toLowerCase().split(/\s+/).filter(function(t) { return t.length > 0; });
        var nextOp = 'AND';
        tokens.forEach(function(token) {
            if (token === 'and') { nextOp = 'AND'; return; }
            if (token === 'or')  { nextOp = 'OR'; return; }
            if (token === 'not') { nextOp = 'NOT'; return; }
            // Punkt entfernen (Referenz: Hinweis2)
            token = token.replace(/\./g, '');
            if (token.length === 0) return;
            terms.push({ word: token, op: nextOp });
            nextOp = 'AND'; // Reset nach jedem Wort
        });
        return terms;
    }

    /**
     * Match a dictionary word against a search term
     * Supports exact match (default), leading/trailing * wildcards, phrases
     */
    function matchWord(dictWord, searchTerm) {
        var sw = searchTerm.word;
        if (searchTerm.phrase) {
            // Phrase: Substring-Suche (Phrase als Ganzes muss vorkommen)
            return dictWord.indexOf(sw) !== -1;
        }
        var hasLeadingStar = sw.charAt(0) === '*';
        var hasTrailingStar = sw.charAt(sw.length - 1) === '*';
        var bare = sw.replace(/^\*|\*$/g, '');
        if (bare.length === 0) return false;
        if (hasLeadingStar && hasTrailingStar) return dictWord.indexOf(bare) !== -1;
        if (hasLeadingStar) return dictWord.length >= bare.length && dictWord.substring(dictWord.length - bare.length) === bare;
        if (hasTrailingStar) return dictWord.indexOf(bare) === 0;
        // Wort-exakt (Default) - auch Teile bei Sonderzeichen-Trennung prüfen
        if (dictWord === bare) return true;
        var sepRe = /[^a-z0-9\u00e4\u00f6\u00fc\u00df]/;
        if (sepRe.test(dictWord)) {
            var parts = dictWord.split(sepRe);
            for (var i = 0; i < parts.length; i++) {
                if (parts[i] === bare) return true;
            }
        }
        return false;
    }

    /**
     * Find pages matching a single search term via dictwords index
     */
    function findPagesForTerm(term) {
        var pageScores = {};
        if (typeof dictwords === 'undefined' || dictwords.length === 0) return pageScores;

        for (var i = 0; i < dictwords.length; i++) {
            var parts = dictwords[i].split(' ');
            var word = parts[0];

            if (!matchWord(word, term)) continue;

            for (var k = 1; k < parts.length; k += 3) {
                var pageId = parseInt(parts[k]);
                var score = parseInt(parts[k + 1]);
                if (!pageScores[pageId]) {
                    pageScores[pageId] = 0;
                }
                pageScores[pageId] += score;
            }
        }
        return pageScores;
    }

    /**
     * Perform fulltext search using dictwords index (zoom_index.js)
     * Supports word-exact matching, * wildcards, AND/OR/NOT operators, quoted phrases
     */
    function performSearch() {
        var query = $('#search-input').val().trim();
        var resultsContainer = $('#search-results');

        if (!query) {
            resultsContainer.html('<p class="search-hint">' + t('searchHint') + '</p>');
            return;
        }

        if (typeof pagedata === 'undefined') {
            resultsContainer.html('<p class="search-error">' + t('searchNoData') + '</p>');
            return;
        }

        var terms = parseSearchQuery(query);
        if (terms.length === 0) {
            resultsContainer.html('<p class="search-hint">' + t('searchHint') + '</p>');
            return;
        }

        var results = [];

        if (typeof dictwords !== 'undefined' && dictwords.length > 0) {
            var andTerms = terms.filter(function(t) { return t.op === 'AND'; });
            var orTerms = terms.filter(function(t) { return t.op === 'OR'; });
            var notTerms = terms.filter(function(t) { return t.op === 'NOT'; });

            // Find pages for each AND term
            var andPageSets = andTerms.map(function(t) { return findPagesForTerm(t); });
            // Find pages for each OR term
            var orPageSets = orTerms.map(function(t) { return findPagesForTerm(t); });
            // Find pages for each NOT term
            var notPageSets = notTerms.map(function(t) { return findPagesForTerm(t); });

            // Build NOT exclusion set
            var excludePages = {};
            notPageSets.forEach(function(ps) {
                for (var pid in ps) excludePages[pid] = true;
            });

            // Combine results: AND intersection + OR union
            var finalScores = {};

            if (andPageSets.length > 0) {
                // Start with first AND term's pages
                var basePids = andPageSets[0];
                for (var pid in basePids) {
                    // Check all other AND terms contain this page
                    var allMatch = true;
                    for (var ai = 1; ai < andPageSets.length; ai++) {
                        if (!andPageSets[ai][pid]) { allMatch = false; break; }
                    }
                    if (allMatch && !excludePages[pid]) {
                        var totalScore = 0;
                        andPageSets.forEach(function(ps) { totalScore += (ps[pid] || 0); });
                        finalScores[pid] = totalScore;
                    }
                }
            }

            // Add OR term pages (union, also exclude NOT pages)
            orPageSets.forEach(function(ps) {
                for (var pid in ps) {
                    if (excludePages[pid]) continue;
                    if (!finalScores[pid]) {
                        // If there are AND terms, OR only adds to existing matches
                        // If there are no AND terms, OR creates the result set
                        if (andPageSets.length === 0) {
                            finalScores[pid] = ps[pid];
                        }
                    } else {
                        finalScores[pid] += ps[pid];
                    }
                }
            });

            // If only OR terms (no AND terms): union of all OR pages
            if (andPageSets.length === 0 && orPageSets.length > 0) {
                orPageSets.forEach(function(ps) {
                    for (var pid in ps) {
                        if (excludePages[pid]) continue;
                        if (!finalScores[pid]) finalScores[pid] = 0;
                        finalScores[pid] += ps[pid];
                    }
                });
            }

            // Convert to results
            for (var pageId in finalScores) {
                var pid = parseInt(pageId);
                if (pid < pagedata.length) {
                    results.push({
                        url: pagedata[pid][0].replace('./', ''),
                        title: pagedata[pid][1] || pagedata[pid][0],
                        score: finalScores[pageId]
                    });
                }
            }
        } else {
            // Fallback: simple pagedata search with parsed terms
            var searchWords = terms.filter(function(t) { return t.op !== 'NOT'; }).map(function(t) { return t.word.replace(/^\*|\*$/g, ''); });
            pagedata.forEach(function(page) {
                var url = page[0];
                var title = page[1] || '';
                var description = page[2] || '';
                var searchText = (title + ' ' + description).toLowerCase();

                var allFound = searchWords.every(function(w) {
                    return searchText.indexOf(w) !== -1;
                });

                if (allFound) {
                    var score = 0;
                    searchWords.forEach(function(w) {
                        if (title.toLowerCase().indexOf(w) !== -1) score += 10;
                        if (description.toLowerCase().indexOf(w) !== -1) score += 1;
                    });
                    results.push({
                        url: url.replace('./', ''),
                        title: title,
                        score: score
                    });
                }
            });
        }

        // Sort by score descending
        results.sort(function(a, b) {
            return b.score - a.score;
        });

        // Remember search words for highlighting (only actual words, no operators)
        lastSearchWords = terms.filter(function(t) { return t.op !== 'NOT'; }).map(function(t) {
            return t.word.replace(/^\*|\*$/g, '');
        }).filter(function(w) { return w.length > 0; });

        // Activate highlighting by default after search
        highlightActive = true;
        $('#search-highlight-button').addClass('active');

        // Display results
        if (results.length === 0) {
            resultsContainer.html('<p class="search-no-results">' + t('searchNoResults', { query: escapeHtml(query) }) + '</p>');
        } else {
            var html = '<ul class="search-results-list">';
            html += '<li class="search-count">' + t('searchCount', { count: results.length }) + '</li>';

            results.forEach(function(result) {
                html += '<li class="search-result-item">';
                html += '<a href="#' + result.url + '" class="search-result-link" data-topic="' + result.url + '">' + escapeHtml(decodeHtmlEntities(result.title)) + '</a>';
                html += '</li>';
            });

            html += '</ul>';
            resultsContainer.html(html);

            // Add click handlers
            resultsContainer.find('.search-result-link').on('click', function(e) {
                e.preventDefault();
                var topic = $(this).data('topic');
                loadTopic(topic);
                if ($(window).width() < 768) {
                    $('#sidebar').removeClass('open');
                }
            });
        }
    }

    /**
     * Highlight search terms in #content using TreeWalker
     * Supports word-exact highlighting with word boundary awareness
     */
    function highlightSearchTerms() {
        removeHighlights();
        if (!lastSearchWords.length) return;

        var content = document.getElementById('content');
        if (!content) return;

        // Build regex from all search words (already stripped of * wildcards)
        var escaped = lastSearchWords.map(function(w) {
            return w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        });
        var regex = new RegExp('(' + escaped.join('|') + ')', 'gi');

        // Walk all text nodes and wrap matches with <mark>
        var walker = document.createTreeWalker(content, NodeFilter.SHOW_TEXT, null, false);
        var textNodes = [];
        while (walker.nextNode()) {
            textNodes.push(walker.currentNode);
        }

        textNodes.forEach(function(node) {
            if (!regex.test(node.textContent)) return;
            regex.lastIndex = 0;

            var frag = document.createDocumentFragment();
            var text = node.textContent;
            var lastIdx = 0;
            var match;

            while ((match = regex.exec(text)) !== null) {
                // Text before match
                if (match.index > lastIdx) {
                    frag.appendChild(document.createTextNode(text.substring(lastIdx, match.index)));
                }
                // Highlighted match
                var mark = document.createElement('mark');
                mark.className = 'search-highlight';
                mark.textContent = match[0];
                frag.appendChild(mark);
                lastIdx = regex.lastIndex;
            }

            // Remaining text
            if (lastIdx < text.length) {
                frag.appendChild(document.createTextNode(text.substring(lastIdx)));
            }

            node.parentNode.replaceChild(frag, node);
        });

        highlightActive = true;
        currentHighlightIndex = -1;
    }

    /**
     * Remove all highlights from #content
     */
    function removeHighlights() {
        $('#content mark.search-highlight').each(function() {
            var parent = this.parentNode;
            parent.replaceChild(document.createTextNode(this.textContent), this);
            parent.normalize();
        });
        highlightActive = false;
        currentHighlightIndex = -1;
    }

    /**
     * Jump to prev/next highlight in content (orange current-highlight)
     */
    function jumpToHighlight(direction) {
        var marks = $('#content mark.search-highlight');
        if (marks.length === 0) {
            if (lastSearchWords.length) {
                highlightSearchTerms();
                $('#search-highlight-button').addClass('active');
                marks = $('#content mark.search-highlight');
                if (marks.length === 0) return;
            } else {
                return;
            }
        }

        // Remove old current-highlight
        marks.removeClass('current-highlight');

        if (direction === 'next') {
            currentHighlightIndex++;
            if (currentHighlightIndex >= marks.length) currentHighlightIndex = 0;
        } else {
            currentHighlightIndex--;
            if (currentHighlightIndex < 0) currentHighlightIndex = marks.length - 1;
        }

        var target = marks.eq(currentHighlightIndex);
        target.addClass('current-highlight');
        target[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // ============================================
    // Shell Initialization
    // ============================================

    /**
     * Initialize the shell after TOC data is loaded
     */
    function initShell() {
        applyTranslations();
        buildTocTree(tocData, $('#toc-container'));

        // Initialize accordion
        initAccordion();

        // Initialize fulltext search
        initFulltextSearch();

        // Initialize toolbar
        initToolbar();

        // Initialize splitter
        initSplitter();

        // Handle hash changes for navigation
        $(window).on('hashchange', function() {
            loadTopicFromHash();
        });

        // Load initial topic
        if (!loadTopicFromHash()) {
            loadTopic(getFirstTopic());
        }

        // Setup sidebar toggle
        $('#sidebar-toggle').on('click', function() {
            $('#sidebar').toggleClass('open');
        });
    }

    /**
     * Initialize draggable splitter between sidebar and content
     */
    function initSplitter() {
        var splitter = document.getElementById('splitter');
        var shell = document.getElementById('shell');
        if (!splitter || !shell) return;

        var STORAGE_KEY = 'help-sidebar-width';
        var MIN_WIDTH = 200;
        var MAX_RATIO = 0.5;

        // Restore saved width
        var saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            var px = parseInt(saved, 10);
            if (px >= MIN_WIDTH && px <= window.innerWidth * MAX_RATIO) {
                shell.style.setProperty('--sidebar-width', px + 'px');
            }
        }

        // Pointer Events for drag (works for mouse + touch)
        var dragging = false, startX, startWidth;

        splitter.addEventListener('pointerdown', function(e) {
            if (e.button !== 0) return;
            e.preventDefault();
            dragging = true;
            startX = e.clientX;
            startWidth = document.getElementById('sidebar').offsetWidth;
            document.body.classList.add('splitter-dragging');
            splitter.classList.add('dragging');
            splitter.setPointerCapture(e.pointerId);
        });

        splitter.addEventListener('pointermove', function(e) {
            if (!dragging) return;
            var w = Math.max(MIN_WIDTH, Math.min(
                startWidth + e.clientX - startX,
                window.innerWidth * MAX_RATIO
            ));
            shell.style.setProperty('--sidebar-width', w + 'px');
        });

        splitter.addEventListener('pointerup', function(e) {
            if (!dragging) return;
            dragging = false;
            document.body.classList.remove('splitter-dragging');
            splitter.classList.remove('dragging');
            try { localStorage.setItem(STORAGE_KEY, document.getElementById('sidebar').offsetWidth); } catch(ex) {}
        });

        splitter.addEventListener('lostpointercapture', function() {
            if (!dragging) return;
            dragging = false;
            document.body.classList.remove('splitter-dragging');
            splitter.classList.remove('dragging');
            try { localStorage.setItem(STORAGE_KEY, document.getElementById('sidebar').offsetWidth); } catch(ex) {}
        });

        // Clamp width on window resize
        window.addEventListener('resize', function() {
            if (window.innerWidth <= 768) return;
            var cur = document.getElementById('sidebar').offsetWidth;
            var max = window.innerWidth * MAX_RATIO;
            if (cur > max) {
                shell.style.setProperty('--sidebar-width', max + 'px');
                try { localStorage.setItem(STORAGE_KEY, Math.round(max)); } catch(ex) {}
            }
        });
    }

    /**
     * Initialize toolbar buttons
     */
    function initToolbar() {
        // Navigation buttons
        $('#btn-prev').on('click', function() {
            if (!$(this).prop('disabled')) {
                navigatePrev();
            }
        });

        $('#btn-next').on('click', function() {
            if (!$(this).prop('disabled')) {
                navigateNext();
            }
        });

        $('#btn-home').on('click', function() {
            loadTopic(getFirstTopic());
        });

        $('#btn-goto').on('click', function() {
            openGotoDialog();
        });

        // Chapters buttons
        $('#btn-collapse-toc').on('click', function() {
            collapseToc();
        });

        $('#btn-load-subchapters').on('click', function() {
            loadAllSubchapters();
        });

        // Print button
        $('#btn-print').on('click', function() {
            window.print();
        });
    }

    /**
     * Navigate to previous topic
     */
    function navigatePrev() {
        const currentIndex = flatToc.findIndex(item => item.hf === currentTopic);
        if (currentIndex > 0) {
            loadTopic(flatToc[currentIndex - 1].hf);
        }
    }

    /**
     * Navigate to next topic
     */
    function navigateNext() {
        const currentIndex = flatToc.findIndex(item => item.hf === currentTopic);
        if (currentIndex < flatToc.length - 1) {
            loadTopic(flatToc[currentIndex + 1].hf);
        }
    }

    /**
     * Open dialog to navigate to topic by ID
     */
    function openGotoDialog() {
        // Create overlay + dialog if not yet in DOM
        if (!document.getElementById('goto-overlay')) {
            var html = '<div id="goto-overlay">' +
                '<div id="goto-dialog">' +
                    '<div id="goto-dialog-header">' +
                        '<img src="./images/Search_32x32.png" alt="" />' +
                        '<span>' + t('gotoTitle') + '</span>' +
                    '</div>' +
                    '<div id="goto-dialog-content">' +
                        '<div id="goto-dialog-body">' +
                            '<label for="goto-input">' + t('gotoLabel') + '</label>' +
                            '<input type="text" id="goto-input" />' +
                        '</div>' +
                        '<div id="goto-dialog-footer">' +
                            '<button id="goto-ok">' + t('gotoOk') + '</button>' +
                            '<button id="goto-cancel">' + t('gotoCancel') + '</button>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>';
            $('body').append(html);

            $('#goto-ok').on('click', gotoSubmit);
            $('#goto-cancel').on('click', gotoClose);
            $('#goto-overlay').on('click', function(e) {
                if (e.target === this) gotoClose();
            });
            $('#goto-input').on('keydown', function(e) {
                if (e.key === 'Enter') gotoSubmit();
                if (e.key === 'Escape') gotoClose();
            });
        }

        // Position dialog near the button
        var btn = document.getElementById('btn-goto');
        var rect = btn.getBoundingClientRect();
        var dlg = document.getElementById('goto-dialog');
        dlg.style.position = 'fixed';
        dlg.style.left = rect.left + 'px';
        dlg.style.top = (rect.bottom + 4) + 'px';
        dlg.style.transform = 'none';

        $('#goto-input').val(currentTopic ? currentTopic.replace(/\.html$/, '') : '');
        $('#goto-overlay').show();
        $('#goto-input').focus().select();
    }

    function gotoSubmit() {
        var id = $('#goto-input').val().trim();
        if (!id) return;
        var searchId = id.toLowerCase();
        var found = flatToc.find(function(item) {
            var hf = item.hf.toLowerCase();
            return hf === searchId ||
                   hf === searchId + '.html' ||
                   hf.includes(searchId);
        });
        if (found) {
            gotoClose();
            loadTopic(found.hf);
        } else {
            alert(t('alertNotFound', { id: id }));
        }
    }

    function gotoClose() {
        $('#goto-overlay').hide();
    }

    /**
     * Collapse all TOC nodes
     */
    function collapseToc() {
        $('.toc-item.expanded').removeClass('expanded');
        updateTocIcons();
    }

    /**
     * Load current topic and all subchapters sequentially into content area
     * Stops when reaching a topic at the same or higher level as the start topic
     */
    function loadAllSubchapters() {
        if (!currentTopic) return;

        // Find current topic in flatToc
        const currentIndex = flatToc.findIndex(item => item.hf === currentTopic);
        if (currentIndex === -1) {
            alert(t('alertNoChapter'));
            return;
        }

        const startLevel = flatToc[currentIndex].lv;

        // Collect topics to load: current + all following with level > startLevel
        const topicsToLoad = [];

        // 1. Add current topic first
        topicsToLoad.push(flatToc[currentIndex]);

        // 2. Add following topics with higher level (deeper in hierarchy)
        for (let i = currentIndex + 1; i < flatToc.length; i++) {
            const topic = flatToc[i];

            // Stop when we reach a topic at same or higher level
            if (topic.lv <= startLevel) {
                break;
            }

            topicsToLoad.push(topic);
        }

        if (topicsToLoad.length === 0) {
            alert(t('alertNoSubchapters'));
            return;
        }

        // Show loading state
        $('#content').addClass('loading').html('<p>' + t('loadingChapters') + '</p>');

        // Load topics sequentially
        loadTopicsSequentially(topicsToLoad, 0, []);
    }

    /**
     * Recursively load topics one by one
     * @param {Array} topics - Array of topic objects to load
     * @param {number} index - Current index
     * @param {Array} loadedContents - Accumulated content array
     */
    function loadTopicsSequentially(topics, index, loadedContents) {
        // Base case: all topics loaded
        if (index >= topics.length) {
            displayCombinedContent(loadedContents);
            return;
        }

        const topic = topics[index];

        // Load current topic
        loadSingleTopicSequential(topic.hf, topic.cp, function(error, content, topicId) {
            if (error) {
                console.error('Error loading topic:', topic.hf, error);
                // Continue with next topic despite error
                loadTopicsSequentially(topics, index + 1, loadedContents);
                return;
            }

            // Add loaded content with title and topicId
            loadedContents.push({
                title: topic.cp,
                topicId: topicId,
                content: content,
                url: topic.hf  // NEU: URL für Verlinkung speichern
            });

            // Update loading message
            $('#content').html('<p>' + t('loadingProgress', { current: index + 1, total: topics.length }) + '</p>');

            // Continue with next topic
            loadTopicsSequentially(topics, index + 1, loadedContents);
        });
    }

    /**
     * Display combined content of all loaded topics
     * @param {Array} contents - Array of {title, topicId, content, url} objects
     */
    function displayCombinedContent(contents) {
        let combinedHtml = '';

        contents.forEach(function(c, index) {
            if (c) {
                // Add separator before all topics except the first
                if (index > 0) {
                    combinedHtml += '<hr style="margin: 2rem 0; border: none; border-top: 2px solid #ddd;">';
                }

                combinedHtml += '<div class="subchapter">';

                // Add title with TopicID
                // First title (index 0) is not a link (user is already on that page)
                // Subsequent titles are clickable links
                if (index === 0) {
                    // Static title (no link)
                    combinedHtml += '<h2 class="subchapter-title">' +
                                   escapeHtml(c.title) +
                                   ' <span class="topic-id">(' + escapeHtml(c.topicId) + ')</span>' +
                                   '</h2>';
                } else {
                    // Clickable title (with link)
                    combinedHtml += '<h2 class="subchapter-title">' +
                                   '<a href="' + escapeHtml(c.url) + '">' + escapeHtml(c.title) + '</a>' +
                                   ' <span class="topic-id">(' + escapeHtml(c.topicId) + ')</span>' +
                                   '</h2>';
                }

                // Add content (remove original h1/h2 if present to avoid duplication)
                let cleanContent = c.content;
                cleanContent = cleanContent.replace(/<h1[^>]*>.*?<\/h1>/i, '');
                cleanContent = cleanContent.replace(/<h2[^>]*>.*?<\/h2>/i, '');

                combinedHtml += cleanContent;
                combinedHtml += '</div>';
            }
        });

        $('#content').html(combinedHtml).removeClass('loading');
        $('#content').scrollTop(0);
    }

    /**
     * Find a TOC item by URL
     */
    function findTocItem(items, url) {
        for (let i = 0; i < items.length; i++) {
            if (items[i].hf === url) {
                return items[i];
            }
            if (items[i].items && items[i].items.length > 0) {
                const found = findTocItem(items[i].items, url);
                if (found) return found;
            }
        }
        return null;
    }


    /**
     * Load a single topic via iframe and return its content via callback
     * @param {string} url - Topic URL
     * @param {string} title - Topic title
     * @param {function} callback - Called with (error, htmlContent, topicId)
     */
    function loadSingleTopicSequential(url, title, callback) {
        const iframe = $('<iframe class="topic-loader-sequential">')
            .attr('src', url)
            .css({ position: 'absolute', left: '-9999px', width: '1px', height: '1px' })
            .appendTo('body');

        let completed = false;

        function onMessage(event) {
            if (completed) return;
            if (event.data && event.data.doc) {
                completed = true;
                window.removeEventListener('message', onMessage);
                iframe.remove();

                const parser = new DOMParser();
                const doc = parser.parseFromString(event.data.doc, 'text/html');
                const bodyContent = doc.body.innerHTML;

                // Extract TopicID from body data attribute or derive from URL
                const topicId = doc.body.getAttribute('data-topic-id') ||
                               url.replace('.html', '');

                callback(null, bodyContent, topicId);
            }
        }

        window.addEventListener('message', onMessage);

        iframe.on('load', function() {
            iframe[0].contentWindow.postMessage('getContent', '*');
        });

        // Timeout for error handling
        setTimeout(function() {
            if (!completed) {
                completed = true;
                window.removeEventListener('message', onMessage);
                iframe.remove();
                callback(new Error('Timeout loading ' + url), null, null);
            }
        }, 5000);
    }

    /**
     * Initialize accordion panel switching
     * - Immer genau ein Panel offen (wie Referenz)
     * - Slide-Animation beim Wechsel
     */
    function initAccordion() {
        $('.accordion-header').on('click', function() {
            var panel = $(this).closest('.accordion-panel');

            // Bereits offen -> nicht schliessen (immer eins offen)
            if (panel.hasClass('expanded')) {
                return;
            }

            // CSS-Transition: einfach Klassen toggeln, Browser animiert via flex-grow
            var oldPanel = $('.accordion-panel.expanded');
            oldPanel.removeClass('expanded');
            panel.addClass('expanded');
        });
    }

    // ============================================
    // TOC Tree Building
    // ============================================

    /**
     * Build TOC tree as nested ul/li
     */
    function buildTocTree(items, container) {
        if (!items || items.length === 0) return;

        const ul = $('<ul class="toc-list"></ul>');

        items.forEach(function(item) {
            const li = $('<li class="toc-item"></li>');
            const hasChildren = item.items && item.items.length > 0;

            if (hasChildren) {
                li.addClass('has-children');
            }

            // Create link wrapper
            const linkWrapper = $('<div class="toc-link-wrapper"></div>');

            // Icon (circle via CSS, no click handler needed)
            const icon = $('<span class="toc-icon"></span>');
            linkWrapper.append(icon);

            // Link - clicking navigates AND toggles expand for items with children
            const link = $('<a class="toc-link"></a>');
            link.text(item.cp);
            link.attr('href', '#' + item.hf);
            link.attr('data-topic', item.hf);
            link.on('click', function(e) {
                e.preventDefault();
                loadTopic(item.hf);
                // Toggle expand/collapse for items with children
                if (hasChildren) {
                    li.toggleClass('expanded');
                }
                // Close sidebar on mobile after selection
                if ($(window).width() < 768) {
                    $('#sidebar').removeClass('open');
                }
            });
            linkWrapper.append(link);

            li.append(linkWrapper);

            // Recursively build children
            if (hasChildren) {
                const childContainer = $('<div class="toc-children"></div>');
                buildTocTree(item.items, childContainer);
                li.append(childContainer);
            }

            ul.append(li);
        });

        container.append(ul);
    }

    // ============================================
    // Topic Loading
    // ============================================

    /**
     * Get the first topic URL
     */
    function getFirstTopic() {
        if (flatToc.length > 0) {
            return flatToc[0].hf;
        }
        return 'index.html';
    }

    /**
     * Load topic from URL hash
     */
    function loadTopicFromHash() {
        const hash = window.location.hash;
        if (hash && hash.length > 1) {
            const query = hash.substring(1); // e.g. "?id=13111" or "fs_xxx.html"

            // Context-ID call: #?id=13111
            if (query.startsWith('?')) {
                const params = new URLSearchParams(query);
                const contextId = params.get('id');
                if (contextId && typeof hmContextIds !== 'undefined' && hmContextIds[contextId]) {
                    loadTopic(hmContextIds[contextId]);
                    return true;
                }
                return false;
            }

            // Direct filename: #fs_xxx.html
            const topicUrl = query.split('?')[0];
            loadTopic(topicUrl);
            return true;
        }
        return false;
    }

    /**
     * Load a topic via iframe + postMessage
     * Works with both file:// and http:// protocols (CORS workaround)
     */
    function loadTopic(url) {
        if (!url) return;

        currentTopic = url;

        // Update URL hash
        if (window.location.hash !== '#' + url) {
            history.pushState(null, '', '#' + url);
        }

        // Show loading state
        $('#content').addClass('loading');

        // Remove old loader iframe
        $('#topic-loader').remove();

        // Create hidden iframe
        const iframe = $('<iframe id="topic-loader">')
            .attr('src', url)
            .css({ position: 'absolute', left: '-9999px', width: '1px', height: '1px' })
            .appendTo('body');

        // One-time message handler
        function onMessage(event) {
            if (event.data && event.data.doc) {
                window.removeEventListener('message', onMessage);
                iframe.remove();

                // Parse HTML and extract body
                const parser = new DOMParser();
                const doc = parser.parseFromString(event.data.doc, 'text/html');
                const bodyContent = doc.body.innerHTML;
                const title = doc.title;

                // Update content
                $('#content').html(bodyContent).removeClass('loading');
                if (title) {
                    document.title = title + t('pageTitleSuffix');
                }

                // #11: Append "Themen:" section with child topic links
                if (tocData) {
                    var tocItem = findTocItem(tocData, url);
                    if (tocItem && tocItem.items && tocItem.items.length > 0) {
                        var themenHtml = '<div class="related-topics-header">';
                        themenHtml += '<hr />';
                        themenHtml += '<p>' + t('relatedTopics') + '</p>';
                        themenHtml += '<div class="related-topics">';
                        tocItem.items.forEach(function(child) {
                            if (child.hf) {
                                themenHtml += '<p><span class="related-topic-icon"></span>' +
                                    '<a class="topic-link" href="' +
                                    child.hf + '">' + escapeHtml(child.cp) + '</a></p>';
                            }
                        });
                        themenHtml += '</div></div>';
                        $('#content').append(themenHtml);
                    }
                }

                // #12: Make content links navigable within the shell
                // Uses event delegation so dynamically added links (e.g. Themen) also work
                $('#content').off('click.shellnav').on('click.shellnav', 'a[href]', function(e) {
                    var href = $(this).attr('href');
                    if (href && !href.startsWith('http') && !href.startsWith('mailto:') && !href.startsWith('#')) {
                        e.preventDefault();
                        loadTopic(href);
                    }
                });

                // Update navigation
                updateNavigation(url, $(doc));

                // Update TOC highlighting
                updateTocHighlight(url);

                // Scroll to top
                $('#content').scrollTop(0);

                // Auto-highlight search terms only when Volltextsuche panel is active
                if (highlightActive && lastSearchWords.length &&
                    $('.accordion-panel[data-panel="search"]').hasClass('expanded')) {
                    highlightSearchTerms();
                }
            }
        }

        window.addEventListener('message', onMessage);

        // iframe.onload -> Request content
        iframe.on('load', function() {
            iframe[0].contentWindow.postMessage('getContent', '*');
        });

        // Timeout for error handling
        setTimeout(function() {
            if ($('#topic-loader').length) {
                window.removeEventListener('message', onMessage);
                iframe.remove();
                $('#content').html(
                    '<div class="error-message">' +
                    '<h2>' + t('errorLoadTitle') + '</h2>' +
                    '<p>' + t('errorLoadText', { url: url }) + '</p>' +
                    '</div>'
                ).removeClass('loading');
            }
        }, 5000);
    }

    // ============================================
    // Navigation
    // ============================================

    /**
     * Update prev/next navigation and breadcrumb
     */
    function updateNavigation(url, doc) {
        // Try to get prev/next from link rel tags in the loaded document
        let prevUrl = null;
        let nextUrl = null;

        const prevLink = doc.filter('link[rel="prev"]').add(doc.find('link[rel="prev"]'));
        const nextLink = doc.filter('link[rel="next"]').add(doc.find('link[rel="next"]'));

        if (prevLink.length > 0) {
            prevUrl = prevLink.attr('href');
        }
        if (nextLink.length > 0) {
            nextUrl = nextLink.attr('href');
        }

        // Fallback: use flatToc for navigation
        const currentIndex = flatToc.findIndex(item => item.hf === url);
        if (!prevUrl && currentIndex > 0) {
            prevUrl = flatToc[currentIndex - 1].hf;
        }
        if (!nextUrl && currentIndex < flatToc.length - 1) {
            nextUrl = flatToc[currentIndex + 1].hf;
        }

        // Update prev button
        $('#btn-prev').prop('disabled', !prevUrl);

        // Update next button
        $('#btn-next').prop('disabled', !nextUrl);

        // Update breadcrumb
        updateBreadcrumb(url);
    }

    /**
     * Get the path from root to a topic in the TOC
     */
    function getTocPath(url) {
        const path = [];

        function findPath(items, targetUrl, currentPath) {
            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                const newPath = currentPath.concat([{ title: item.cp, url: item.hf }]);

                if (item.hf === targetUrl) {
                    return newPath;
                }

                if (item.items && item.items.length > 0) {
                    const found = findPath(item.items, targetUrl, newPath);
                    if (found) return found;
                }
            }
            return null;
        }

        return findPath(tocData, url, []) || [];
    }

    /**
     * Update breadcrumb display
     * Shows only parent path as clickable links (current page is excluded,
     * matching the reference behavior where breadcrumb = parent navigation)
     */
    function updateBreadcrumb(url) {
        const path = getTocPath(url);
        // Only show parent items (exclude current page)
        const parentPath = path.slice(0, -1);

        if (parentPath.length === 0) {
            $('#breadcrumb').empty();
            return;
        }

        const html = parentPath.map(function(item) {
            return '<a href="#' + item.url + '" data-topic="' + item.url + '">' + escapeHtml(item.title) + '</a>';
        }).join('<span class="separator">' + t('breadcrumbSep') + '</span>');

        $('#breadcrumb').html(html);

        // Add click handlers for breadcrumb links
        $('#breadcrumb a').on('click', function(e) {
            e.preventDefault();
            const topic = $(this).data('topic');
            loadTopic(topic);
        });
    }

    /**
     * Update TOC highlighting and expand parent nodes
     */
    function updateTocHighlight(url) {
        // Remove all active states
        $('.toc-link').removeClass('active');
        $('.toc-item').removeClass('active-item');

        // Find and highlight the active link
        const activeLink = $('.toc-link[data-topic="' + url + '"]');
        if (activeLink.length > 0) {
            activeLink.addClass('active');

            // Mark parent item
            const parentItem = activeLink.closest('.toc-item');
            parentItem.addClass('active-item');

            // Expand all parent nodes
            parentItem.parents('.toc-item.has-children').addClass('expanded');

            // Update icons for expanded items
            updateTocIcons();

            // Scroll TOC to show active item
            scrollTocToActive(activeLink);
        }
    }

    /**
     * Update TOC icons based on expanded state
     */
    function updateTocIcons() {
        $('.toc-item.has-children').each(function() {
            const $item = $(this);
            const $icon = $item.find('> .toc-link-wrapper > .toc-icon');
            if ($icon.length > 0) {
                const isExpanded = $item.hasClass('expanded');
                const src = isExpanded ? $icon.data('open') : $icon.data('closed');
                if (src) {
                    $icon.attr('src', src);
                }
            }
        });
    }

    /**
     * Scroll TOC container to show active item
     */
    function scrollTocToActive(activeLink) {
        const container = $('#toc-container');
        const linkOffset = activeLink.offset();
        const containerOffset = container.offset();

        if (linkOffset && containerOffset) {
            const relativeTop = linkOffset.top - containerOffset.top;
            const containerHeight = container.height();

            if (relativeTop < 0 || relativeTop > containerHeight - 30) {
                container.scrollTop(container.scrollTop() + relativeTop - containerHeight / 3);
            }
        }
    }

    // ============================================
    // Utility Functions
    // ============================================

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function decodeHtmlEntities(text) {
        var div = document.createElement('div');
        div.innerHTML = text;
        return div.textContent;
    }

    function truncateText(text, maxLength) {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

})();
