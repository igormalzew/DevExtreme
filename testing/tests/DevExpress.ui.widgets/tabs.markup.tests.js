import $ from "jquery";
import Tabs from "ui/tabs";
import ariaAccessibilityTestHelper from '../../helpers/ariaAccessibilityTestHelper.js';

QUnit.testStart(() => {
    const markup =
        '<div id="tabs"></div>\
        <div id="widget"></div>\
        <div id="widthRootStyle" style="width: 300px;"></div>';

    $("#qunit-fixture").html(markup);
});

const TABS_CLASS = "dx-tabs",
    TABS_WRAPPER_CLASS = "dx-tabs-wrapper";

const toSelector = cssClass => "." + cssClass;

QUnit.module("Tabs markup", () => {
    QUnit.test("tabs should have correct class", (assert) => {
        const $tabsElement = $("#tabs").dxTabs({
            items: ["1", "2", "3"]
        });

        assert.ok($tabsElement.hasClass(TABS_CLASS), "tabs has correct class");
    });

    QUnit.test("tabs should have wrapper with correct class", (assert) => {
        const $tabsElement = $("#tabs").dxTabs({
            items: ["1", "2", "3"]
        });

        assert.ok($tabsElement.find(toSelector(TABS_WRAPPER_CLASS)).length, "tabs has wrapper");
    });

    QUnit.test("items rendering", (assert) => {
        const tabsElement = $("#tabs").dxTabs({
            items: [
                { text: "0", icon: "custom" },
                { text: "1", icon: "http://1.png" },
                { text: "2" }
            ]
        });

        const tabsInstance = tabsElement.dxTabs("instance"),
            tabElements = tabsInstance._itemElements();

        assert.equal(tabsInstance.option("selectedIndex"), -1);

        assert.equal($.trim(tabsElement.text()), "012");

        assert.equal(tabElements.find(".dx-icon-custom").length, 1);

        var icon = tabElements.find("img");
        assert.equal(icon.length, 1);
        assert.equal(icon.attr("src"), "http://1.png");
    });
});

QUnit.module("Badges", () => {
    QUnit.test("item badge render", (assert) => {
        const $element = $("#widget").dxTabs({
            items: [
                { text: "user", badge: 1 },
                { text: "analytics" }
            ],
            width: 400
        });

        assert.ok($element.find(".dx-tab:eq(0) .dx-badge").length, "badge on the first item exists");
        assert.ok(!$element.find(".dx-tab:eq(1) .dx-badge").length, "badge on the second item is not exist");
    });
});

QUnit.module("Widget sizing render", () => {
    QUnit.test("constructor", (assert) => {
        const $element = $("#widget").dxTabs({
                items: [
                    { text: "user" },
                    { text: "analytics" },
                    { text: "customers" },
                    { text: "search" },
                    { text: "favorites" }
                ], width: 400
            }),
            instance = $element.dxTabs("instance");

        assert.strictEqual(instance.option("width"), 400);
        assert.strictEqual($element[0].style.width, 400 + "px", "outer width of the element must be equal to custom width");
    });

    QUnit.test("root with custom width", (assert) => {
        const $element = $("#widthRootStyle").dxTabs({
                items: [
                    { text: "user" },
                    { text: "analytics" },
                    { text: "customers" },
                    { text: "search" },
                    { text: "favorites" }
                ]
            }),
            instance = $element.dxTabs("instance");

        assert.strictEqual(instance.option("width"), undefined);
        assert.strictEqual($element[0].style.width, 300 + "px", "outer width of the element must be equal to custom width");
    });
});

var helper;
QUnit.module("Aria accessibility", {
    beforeEach: () => {
        this.items = [{ text: "Item_1" }, { text: "Item_2" }, { text: "Item_3" }];
        helper = new ariaAccessibilityTestHelper({
            createWidget: ($element, options) => new Tabs($element, $.extend({
                focusStateEnabled: true
            }, options))
        });
    },
    afterEach: () => {
        helper.$widget.remove();
    }
}, () => {
    QUnit.test(`3 items`, () => {
        helper.createWidget({ items: this.items });

        helper.checkAttributes(helper.$widget, { role: "tablist", tabindex: "0" }, "widget");
        helper.checkItemsAttributes([], { attributes: ["aria-selected"], role: "tab" });
    });

    QUnit.test(`3 items, selectedIndex: 1`, () => {
        helper.createWidget({ items: this.items, selectedIndex: 1 });

        helper.checkAttributes(helper.$widget, { role: "tablist", tabindex: "0" }, "widget");
        helper.checkItemsAttributes([1], { attributes: ["aria-selected"], role: "tab" });
    });

    QUnit.test(`3 items, selectedIndex: 1, set focusedElement: items[1] -> clean focusedElement`, () => {
        helper.createWidget({ items: this.items, selectedIndex: 1 });

        helper.widget.option("focusedElement", helper.getItems().eq(1));
        helper.checkAttributes(helper.$widget, { role: "tablist", "aria-activedescendant": helper.widget.getFocusedItemId(), tabindex: "0" }, "widget");
        helper.checkItemsAttributes([1], { focusedItemIndex: 1, attributes: ["aria-selected"], role: "tab" });

        helper.widget.option("focusedElement", null);
        helper.checkAttributes(helper.$widget, { role: "tablist", tabindex: "0" }, "widget");
        helper.checkItemsAttributes([1], { attributes: ["aria-selected"], role: "tab" });
    });
});

const TABS_ITEM_TEXT_CLASS = "dx-tab-text";

const moduleConfig = {
    beforeEach: () => {
        this.prepareItemTest = (data) => {
            const tabs = new Tabs($("<div>"), {
                items: [data]
            });

            return tabs.itemElements().eq(0).find(".dx-item-content").contents();
        };
    }
};

QUnit.module("Default template", moduleConfig, () => {
    QUnit.test("template should be rendered correctly with text", (assert) => {
        const $content = this.prepareItemTest("custom");

        assert.equal($content.text(), "custom");
    });

    QUnit.test("template should be rendered correctly with boolean", (assert) => {
        const $content = this.prepareItemTest(true);

        assert.equal($.trim($content.text()), "true");
    });

    QUnit.test("template should be rendered correctly with number", (assert) => {
        const $content = this.prepareItemTest(1);

        assert.equal($.trim($content.text()), "1");
    });

    QUnit.test("template should be rendered correctly with text", (assert) => {
        const $content = this.prepareItemTest({ text: "custom" });

        assert.equal($.trim($content.text()), "custom");
    });

    QUnit.test("template should be rendered correctly with html", (assert) => {
        const $content = this.prepareItemTest({ html: "<span>test</span>" });

        const $span = $content.is("span") ? $content : $content.children();
        assert.ok($span.length);
        assert.equal($span.text(), "test");
    });

    QUnit.test("template should be rendered correctly with htmlstring", (assert) => {
        const $content = this.prepareItemTest("<span>test</span>");

        assert.equal($content.text(), "<span>test</span>");
    });

    QUnit.test("template should be rendered correctly with html & text", (assert) => {
        const $content = this.prepareItemTest({ text: "text", html: "<span>test</span>" });

        const $span = $content.is("span") ? $content : $content.children();

        assert.ok($span.length);
        assert.equal($content.text(), "test");
    });

    QUnit.test("template should be rendered correctly with tab text wrapper for data with text field", (assert) => {
        const $content = this.prepareItemTest({ text: "test" });

        assert.equal($content.filter("." + TABS_ITEM_TEXT_CLASS).text(), "test");
    });

    QUnit.test("template should be rendered correctly with tab text wrapper for string data", (assert) => {
        const $content = this.prepareItemTest("test");

        assert.equal($content.filter("." + TABS_ITEM_TEXT_CLASS).text(), "test");
    });

    QUnit.test("template should be rendered correctly with tab text wrapper for string data", (assert) => {
        const $content = this.prepareItemTest("test");

        assert.equal($content.filter("." + TABS_ITEM_TEXT_CLASS).text(), "test");
    });

    QUnit.test("template should be rendered correctly with icon", (assert) => {
        const $content = this.prepareItemTest({ icon: "test" });

        assert.equal($content.filter(".dx-icon-test").length, 1);
    });

    QUnit.test("template should be rendered correctly with icon path", (assert) => {
        const $content = this.prepareItemTest({ icon: "test.jpg" });

        assert.equal($content.filter(".dx-icon").attr("src"), "test.jpg");
    });

    QUnit.test("template should be rendered correctly with external icon", (assert) => {
        const $content = this.prepareItemTest({ icon: "fa fa-icon" });

        assert.equal($content.filter(".fa.fa-icon").length, 1);
    });
});
