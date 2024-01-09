(function ( $ ) {
   "use strict";
    /**
     * Jquery Plugin to filter rows of a table.
     * Filter type available:
     *     <input type="text" />
     *     <select></select>
     */
    $.fn.tableFilterable = function(options) {
        var settings = $.extend({debug: false}, options);

        var warn, debug;
        if ( window.console && window.console.warn ) {
            warn = (function(args) {console.warn(args);});
        } else {
            warn = function() {};
        }

        if ( settings.debug && window.console && window.console.debug ) {
            debug = (function(args) {console.debug(args);});
        } else {
            debug = function() {};
        }

        return this.each(function() {
            var $table = $(this);

            if ($table.prop("tagName") !== "TABLE") {
                warn("tableFilterable: "+$table.prop("tagName")+ " is not a table element" );
                return;
            }
            var $rows = $table.find('tbody>tr');
            var filters = [];

            var filterTable;    // filter the table
            var getFilterValue; // get value from the filter element

            /**
             * Register filters.
             */
            $.each(settings.filters, function() {
                var filter = this;
                var $filterElem = $(filter.filterSelector);
                if ($filterElem.length===0) {
                    warn("tableFilterable: the selector "+filter.filterSelector+ ' return no element');
                    return;
                }
                if (typeof this.filterCallback !== 'function') {
                    warn('tableFilterable: filterCallback of the filter with selector '+filter.filterSelector+' is not callable');
                    return;
                }
                filters.push({
                    filter: filter,
                    filterElem: $filterElem
                });
                var filterTimeoutId;
                $filterElem.on(filter.event, function(e) {
                    if (filter.delay) {
                        if (filterTimeoutId) {
                            window.clearTimeout(filterTimeoutId);
                        }
                        filterTimeoutId = window.setTimeout(filterTable, filter.delay);
                    } else {
                        filterTable();
                    }

                });
                debug("tableFilterable: register filter selector='"+this.selector+"', event="+this.event);
            });

            /**
             * Return value of a filter depending of its type.
             */
            getFilterValue = function($elem) {
                var filterValue;
                var tagName = $elem.prop('tagName');
                if (tagName == 'INPUT') {
                    var type = $elem.attr('type');
                    if (type == "checkbox")
                        return $elem.prop('checked');
                    else {
                        filterValue = $elem.val();
                    }
                } else if (tagName == 'SELECT') {
                    filterValue = $elem.find("option:selected").val();
                } else {
                    warn("tableFilterable: Can't get value's filter of type "+$elem);
                }

                return filterValue;
            };

            /**
             * Show or hide rows
             */
            filterTable = function(e) {
                var currentNbRowTotal = 0;
                var currentNbRowShown = 0;
                $rows.each(function(i) {
                    currentNbRowTotal++;
                    var $tr = $(this);
                    var show = true;
                    $.each(filters, function() {
                        var filterValue = getFilterValue(this.filterElem);
                        var callbackValue = this.filter.filterCallback($tr, filterValue);
                        debug('tr num='+i+ ', filter='+this.filter.selector+ ', callbackValue='+callbackValue);
                        if (!callbackValue) {
                            show = false;
                            return false;
                        }
                    });
                    if (show) currentNbRowShown++;
                    $tr.toggle(show);
                });

                if (typeof settings.onFilterFinished == 'function') {
                    settings.onFilterFinished(currentNbRowShown, currentNbRowTotal);
                }
            };
        });
    };
})(jQuery);
