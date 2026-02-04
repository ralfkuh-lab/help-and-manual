/**
 * Shell.js - Modern Help Shell for H&M WebHelp Export
 * Features: TOC (Hilfe), Schlagwortsuche, Volltextsuche
 */

(function() {
    'use strict';

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
                flatToc.push(item);
            }
            if (item.items && item.items.length > 0) {
                flattenToc(item.items);
            }
        });
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
            return;
        }

        $('.keywords-item').each(function() {
            const $item = $(this);
            const text = $item.find('> .keywords-wrapper').text().toLowerCase();
            const matches = text.includes(filter);
            const hasMatchingChild = $item.find('.keywords-item').filter(function() {
                return $(this).find('> .keywords-wrapper').text().toLowerCase().includes(filter);
            }).length > 0;

            if (matches || hasMatchingChild) {
                $item.show();
            } else {
                $item.hide();
            }
        });
    }

    // ============================================
    // Volltextsuche - uses pagedata from zoom_pageinfo.js
    // ============================================

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
    }

    /**
     * Perform fulltext search using pagedata
     */
    function performSearch() {
        const query = $('#search-input').val().trim().toLowerCase();
        const resultsContainer = $('#search-results');

        if (!query) {
            resultsContainer.html('<p class="search-hint">Bitte Suchbegriff eingeben.</p>');
            return;
        }

        if (typeof pagedata === 'undefined') {
            resultsContainer.html('<p class="search-error">Suchdaten nicht verfuegbar.</p>');
            return;
        }

        // Search in pagedata: [url, title, description, image]
        const results = [];
        const queryWords = query.split(/\s+/);

        pagedata.forEach(function(page) {
            const url = page[0];
            const title = page[1] || '';
            const description = page[2] || '';
            const searchText = (title + ' ' + description).toLowerCase();

            // Check if all query words are found
            const allWordsFound = queryWords.every(function(word) {
                return searchText.includes(word);
            });

            if (allWordsFound) {
                // Calculate simple relevance score
                let score = 0;
                queryWords.forEach(function(word) {
                    if (title.toLowerCase().includes(word)) score += 10;
                    if (description.toLowerCase().includes(word)) score += 1;
                });

                results.push({
                    url: url.replace('./', ''),
                    title: title,
                    description: description,
                    score: score
                });
            }
        });

        // Sort by score descending
        results.sort(function(a, b) {
            return b.score - a.score;
        });

        // Display results
        if (results.length === 0) {
            resultsContainer.html('<p class="search-no-results">Keine Ergebnisse fuer "' + escapeHtml(query) + '"</p>');
        } else {
            let html = '<ul class="search-results-list">';
            html += '<li class="search-count">' + results.length + ' Kapitel gefunden.</li>';

            results.forEach(function(result) {
                html += '<li class="search-result-item">';
                html += '<a href="#' + result.url + '" class="search-result-link" data-topic="' + result.url + '">' + result.title + '</a>';
                html += '</li>';
            });

            html += '</ul>';
            resultsContainer.html(html);

            // Add click handlers
            resultsContainer.find('.search-result-link').on('click', function(e) {
                e.preventDefault();
                const topic = $(this).data('topic');
                loadTopic(topic);
                if ($(window).width() < 768) {
                    $('#sidebar').removeClass('open');
                }
            });
        }
    }

    // ============================================
    // Shell Initialization
    // ============================================

    /**
     * Initialize the shell after TOC data is loaded
     */
    function initShell() {
        buildTocTree(tocData, $('#toc-container'));

        // Initialize accordion
        initAccordion();

        // Initialize fulltext search
        initFulltextSearch();

        // Initialize toolbar
        initToolbar();

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
        const id = prompt('Topic-ID eingeben:');
        if (id && id.trim()) {
            // Try to find the topic by filename or partial match
            const searchId = id.trim().toLowerCase();
            const found = flatToc.find(item => {
                const hf = item.hf.toLowerCase();
                return hf === searchId ||
                       hf === searchId + '.html' ||
                       hf.includes(searchId);
            });
            if (found) {
                loadTopic(found.hf);
            } else {
                alert('Topic "' + id + '" nicht gefunden.');
            }
        }
    }

    /**
     * Collapse all TOC nodes
     */
    function collapseToc() {
        $('.toc-item.expanded').removeClass('expanded');
        updateTocIcons();
    }

    /**
     * Load all subchapters of current topic into content area
     */
    function loadAllSubchapters() {
        if (!currentTopic) return;

        // Find current topic in TOC data
        const tocItem = findTocItem(tocData, currentTopic);
        if (!tocItem || !tocItem.items || tocItem.items.length === 0) {
            alert('Keine Unterkapitel vorhanden.');
            return;
        }

        // Collect all child topics
        const childTopics = [];
        collectChildTopics(tocItem.items, childTopics);

        if (childTopics.length === 0) {
            alert('Keine Unterkapitel vorhanden.');
            return;
        }

        // Load all child topics and concatenate content
        $('#content').addClass('loading');
        loadMultipleTopics(childTopics);
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
     * Collect all child topic URLs recursively
     */
    function collectChildTopics(items, result) {
        items.forEach(function(item) {
            if (item.hf) {
                result.push({ url: item.hf, title: item.cp });
            }
            if (item.items && item.items.length > 0) {
                collectChildTopics(item.items, result);
            }
        });
    }

    /**
     * Load multiple topics and concatenate their content
     */
    function loadMultipleTopics(topics) {
        let loadedCount = 0;
        const contents = [];

        topics.forEach(function(topic, index) {
            // Create hidden iframe for each topic
            const iframe = $('<iframe class="topic-loader-multi">')
                .attr('src', topic.url)
                .css({ position: 'absolute', left: '-9999px', width: '1px', height: '1px' })
                .appendTo('body');

            function onMessage(event) {
                if (event.data && event.data.doc) {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(event.data.doc, 'text/html');
                    const bodyContent = doc.body.innerHTML;

                    contents[index] = {
                        title: topic.title,
                        content: bodyContent
                    };

                    loadedCount++;
                    window.removeEventListener('message', onMessage);
                    iframe.remove();

                    if (loadedCount === topics.length) {
                        // All topics loaded, combine content
                        let combinedHtml = '';
                        contents.forEach(function(c) {
                            if (c) {
                                combinedHtml += '<div class="subchapter">';
                                combinedHtml += c.content;
                                combinedHtml += '</div><hr style="margin: 2rem 0; border: none; border-top: 1px solid #ddd;">';
                            }
                        });
                        $('#content').html(combinedHtml).removeClass('loading');
                        $('#content').scrollTop(0);
                    }
                }
            }

            window.addEventListener('message', onMessage);

            iframe.on('load', function() {
                iframe[0].contentWindow.postMessage('getContent', '*');
            });
        });

        // Timeout fallback
        setTimeout(function() {
            $('.topic-loader-multi').remove();
            if (loadedCount < topics.length) {
                $('#content').removeClass('loading');
            }
        }, 10000);
    }

    /**
     * Initialize accordion panel switching
     * - Immer genau ein Panel offen (wie Referenz)
     * - Slide-Animation beim Wechsel
     */
    function initAccordion() {
        var animDuration = 200;

        $('.accordion-header').on('click', function() {
            var panel = $(this).closest('.accordion-panel');

            // Bereits offen -> nicht schliessen (immer eins offen)
            if (panel.hasClass('expanded')) {
                return;
            }

            // Altes Panel zuklappen mit Animation
            var oldPanel = $('.accordion-panel.expanded');
            if (oldPanel.length) {
                oldPanel.find('> .accordion-content').slideUp(animDuration, function() {
                    oldPanel.removeClass('expanded');
                });
            }

            // Neues Panel aufklappen mit Animation
            panel.addClass('expanded');
            panel.find('> .accordion-content').hide().slideDown(animDuration);
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
            const topic = hash.substring(1);
            // Remove any query string
            const topicUrl = topic.split('?')[0];
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
                    document.title = title + ' - TRMS Hilfe';
                }

                // #11: Append "Themen:" section with child topic links
                if (tocData) {
                    var tocItem = findTocItem(tocData, url);
                    if (tocItem && tocItem.items && tocItem.items.length > 0) {
                        var themenHtml = '<div class="related-topics-header">';
                        themenHtml += '<hr />';
                        themenHtml += '<p>Themen:</p>';
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
                    '<h2>Fehler beim Laden</h2>' +
                    '<p>Die Seite "' + url + '" konnte nicht geladen werden.</p>' +
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
        }).join('<span class="separator">/</span>');

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

    function truncateText(text, maxLength) {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

})();
