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
                li.addClass('has-children');
            }

            // Keyword wrapper
            const wrapper = $('<div class="keywords-wrapper"></div>');

            // Toggle for items with children
            if (hasChildren) {
                const toggle = $('<span class="keywords-toggle"></span>');
                toggle.on('click', function(e) {
                    e.stopPropagation();
                    li.toggleClass('expanded');
                });
                wrapper.append(toggle);
            }

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

            // Build children recursively
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
            // Show all, collapse all
            $('.keywords-item').show();
            $('.keywords-item').removeClass('expanded');
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
                if (hasMatchingChild) {
                    $item.addClass('expanded');
                }
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
            let html = '<p class="search-count">' + results.length + ' Ergebnis' + (results.length !== 1 ? 'se' : '') + '</p>';
            html += '<ul class="search-results-list">';

            results.forEach(function(result) {
                const snippet = truncateText(result.description, 150);
                html += '<li class="search-result-item">';
                html += '<a href="#' + result.url + '" class="search-result-link" data-topic="' + result.url + '">';
                html += '<span class="search-result-title">' + escapeHtml(result.title) + '</span>';
                if (snippet) {
                    html += '<span class="search-result-snippet">' + escapeHtml(snippet) + '</span>';
                }
                html += '</a></li>';
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

        // Initialize tabs
        initTabs();

        // Initialize fulltext search
        initFulltextSearch();

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
     * Initialize tab switching
     */
    function initTabs() {
        $('.sidebar-tab').on('click', function() {
            const tabId = $(this).data('tab');

            // Update tab buttons
            $('.sidebar-tab').removeClass('active');
            $(this).addClass('active');

            // Update tab content
            $('.tab-content').removeClass('active');
            $('#tab-' + tabId).addClass('active');
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

            // Toggle button for items with children
            if (hasChildren) {
                const toggle = $('<span class="toc-toggle"></span>');
                toggle.on('click', function(e) {
                    e.stopPropagation();
                    li.toggleClass('expanded');
                });
                linkWrapper.append(toggle);
            }

            // Icon
            if (item.i0) {
                const icon = $('<img class="toc-icon" alt="">');
                icon.attr('src', item.i0);
                icon.attr('data-closed', item.i0);
                if (item.i1) {
                    icon.attr('data-open', item.i1);
                }
                linkWrapper.append(icon);
            }

            // Link
            const link = $('<a class="toc-link"></a>');
            link.text(item.cp);
            link.attr('href', '#' + item.hf);
            link.attr('data-topic', item.hf);
            link.on('click', function(e) {
                e.preventDefault();
                loadTopic(item.hf);
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
     * Update prev/next navigation
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
        if (!prevUrl || !nextUrl) {
            const currentIndex = flatToc.findIndex(item => item.hf === url);
            if (currentIndex > 0 && !prevUrl) {
                prevUrl = flatToc[currentIndex - 1].hf;
            }
            if (currentIndex < flatToc.length - 1 && !nextUrl) {
                nextUrl = flatToc[currentIndex + 1].hf;
            }
        }

        // Update prev link
        const $prevLink = $('#prev-link');
        if (prevUrl) {
            $prevLink.attr('href', '#' + prevUrl).removeClass('disabled');
            $prevLink.off('click').on('click', function(e) {
                e.preventDefault();
                loadTopic(prevUrl);
            });
        } else {
            $prevLink.attr('href', '#').addClass('disabled');
            $prevLink.off('click').on('click', function(e) {
                e.preventDefault();
            });
        }

        // Update next link
        const $nextLink = $('#next-link');
        if (nextUrl) {
            $nextLink.attr('href', '#' + nextUrl).removeClass('disabled');
            $nextLink.off('click').on('click', function(e) {
                e.preventDefault();
                loadTopic(nextUrl);
            });
        } else {
            $nextLink.attr('href', '#').addClass('disabled');
            $nextLink.off('click').on('click', function(e) {
                e.preventDefault();
            });
        }
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
