/**
 * Shell.js - Modern Help Shell for H&M WebHelp Export
 * Uses hmcontent.js TOC data directly via hmLoadTOC callback
 */

(function() {
    'use strict';

    // Global state
    let tocData = null;
    let flatToc = [];  // Flattened TOC for prev/next navigation
    let currentTopic = null;

    /**
     * Called by hmcontent.js with TOC data
     * This is the entry point - hmcontent.js calls hmLoadTOC({items:[...]})
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

    /**
     * Initialize the shell after TOC data is loaded
     */
    function initShell() {
        buildTocTree(tocData, $('#toc-container'));

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
     * Load a topic via AJAX
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

        $.ajax({
            url: url,
            dataType: 'html',
            success: function(html) {
                // Parse the HTML
                const doc = $($.parseHTML(html, document, true));

                // Extract body content
                const body = doc.filter('body').add(doc.find('body'));
                let content;
                if (body.length > 0) {
                    content = body.html();
                } else {
                    content = html;
                }

                // Extract title
                const title = doc.filter('title').add(doc.find('title')).text();
                if (title) {
                    document.title = title + ' - TRMS Hilfe';
                }

                // Update content
                $('#content').html(content);

                // Update navigation
                updateNavigation(url, doc);

                // Update TOC highlighting
                updateTocHighlight(url);

                // Scroll to top
                $('#content').scrollTop(0);
            },
            error: function(xhr, status, error) {
                $('#content').html(
                    '<div class="error-message">' +
                    '<h2>Fehler beim Laden</h2>' +
                    '<p>Die Seite "' + url + '" konnte nicht geladen werden.</p>' +
                    '<p>Fehler: ' + error + '</p>' +
                    '</div>'
                );
            },
            complete: function() {
                $('#content').removeClass('loading');
            }
        });
    }

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

})();
