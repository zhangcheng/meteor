test("smartpatch - basic", function() {

  var Patcher = Meteor.ui._Patcher;

  var div = function(html) {
    var n = document.createElement("DIV");
    n.innerHTML = html;
    return n;
  };
  var tag = function(node, tagName, which) {
    return node.getElementsByTagName(tagName)[which || 0];
  };
  var assert_html = function(actual, expected) {
    actual = (typeof actual === "string" ? actual : actual.innerHTML);
    expected = (typeof expected === "string" ? expected : expected.innerHTML);
    assert.equal(actual.toLowerCase(), expected.toLowerCase());
  };

  var x,y,p,ret;

  x = div("<b><i>foo</i><u>bar</u></b>");
  y = div("<b><u>qux</u><s>baz</s></b>");
  p = new Patcher(x, y);
  ret = p.match(tag(x, 'u'), tag(y, 'u'));
  assert.isTrue(ret);
  assert_html(x, "<b><u>bar</u></b>");
  ret = p.finish();
  assert.isTrue(ret);
  assert_html(x, "<b><u>bar</u><s>baz</s></b>");

  x = div("<b><i>foo</i><u>bar</u></b>");
  y = div("<b><u>qux</u><s>baz</s></b>");
  p = new Patcher(x, y);
  ret = p.finish();
  assert.isTrue(ret);
  assert_html(x, "<b><u>qux</u><s>baz</s></b>");

  x = div("<b><i><u>foo</u></i></b><b><i><u><s>bar</s></u></i></b>");
  y = div(
    "1<b>2<i>3<u>foo</u>4</i>5</b>6<b>7<i>8<u>9<s>bar</s>10</u>11</i>12</b>13");
  p = new Patcher(x, y);
  ret = p.match(tag(x, 'u'), tag(y, 'u'));
  assert.isTrue(ret);
  assert_html(x, "1<b>2<i>3<u>foo</u></i></b><b><i><u><s>bar</s></u></i></b>");
  ret = p.match(tag(x, 's'), tag(y, 's'));
  assert.isTrue(ret);
  assert_html(
    x,
    "1<b>2<i>3<u>foo</u>4</i>5</b>6<b>7<i>8<u>9<s>bar</s></u></i></b>");
  ret = p.finish();
  assert.isTrue(ret);
  assert_html(
    x,
    "1<b>2<i>3<u>foo</u>4</i>5</b>6<b>7<i>8<u>9<s>bar</s>10</u>11</i>12</b>13");

  // mismatched parents, detection and recovery

  x = div("<b><i>foo</i><u>bar</u></b>");
  y = div("<b><i>foo</i></b><b><u>bar</u></b>");
  p = new Patcher(x,y);
  ret = p.match(tag(x, 'i'), tag(y, 'i'));
  assert.isTrue(ret);
  assert_html(x, "<b><i>foo</i><u>bar</u></b>");
  ret = p.match(tag(x, 'u'), tag(y, 'u'));
  assert.isFalse(ret);
  assert_html(x, "<b><i>foo</i><u>bar</u></b>");
  ret = p.finish();
  assert.isTrue(ret);
  assert_html(x,"<b><i>foo</i></b><b><u>bar</u></b>");

  x = div("<b><i>foo</i></b><b><u>bar</u></b>");
  y = div("<b><i>foo</i><u>bar</u></b>");
  p = new Patcher(x,y);
  ret = p.match(tag(x, 'i'), tag(y, 'i'));
  assert.isTrue(ret);
  assert_html(x, "<b><i>foo</i></b><b><u>bar</u></b>");
  ret = p.match(tag(x, 'u'), tag(y, 'u'));
  assert.isFalse(ret);
  assert_html(x, "<b><i>foo</i><u>bar</u></b><b><u>bar</u></b>");
  ret = p.finish();
  assert.isTrue(ret);
  assert_html(x, "<b><i>foo</i><u>bar</u></b>");

  // mismatched tag name, detection and recovery
  x = div("<b><i>foo</i><u>bar</u></b>");
  y = div("<i><u>bar</u><s>baz</s></i>");
  p = new Patcher(x, y);
  ret = p.match(tag(x, 'u'), tag(y, 'u'));
  assert.isFalse(ret);
  ret = p.finish();
  assert.isTrue(ret);
  assert_html(x, "<i><u>bar</u><s>baz</s></i>");

  var LiveRange = Meteor.ui._LiveRange;
  var t = "_foo";
  var liverange = function(start, end, inner) {
    return new LiveRange(t, start, end, inner);
  };

  var rangeTest = function(extras) {
    var aaa = extras[0], zzz = extras[1];
    x = div(aaa+"<b><i>foo</i><u>bar</u></b>"+zzz);
    y = div("<b><u>bar</u><s>baz</s></b>");
    var rng = liverange(tag(y, 'u'));
    p = new Patcher(liverange(tag(x, 'b')), y);
    var copyCallback = _.bind(rng.transplant_tag, rng);
    ret = p.match(tag(x, 'u'), tag(y, 'u'), copyCallback);
    assert.isTrue(ret);
    assert_html(x, aaa+"<b><u>bar</u></b>"+zzz);
    ret = p.finish();
    assert.isTrue(ret);
    assert_html(x, aaa+"<b><u>bar</u><s>baz</s></b>"+zzz);
    assert.equal(rng.firstNode(), tag(x, 'u'));
  };

  _.each([["aaa","zzz"], ["",""], ["aaa",""], ["","zzz"]], rangeTest);
});
