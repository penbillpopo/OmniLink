import { camelCase, CamelCase } from './camelcase';

describe('CamelCase', () => {
  it("camelCase('foo')", () => expect(camelCase('foo')).toBe('foo'));
  it("camelCase('foo-bar')", () => expect(camelCase('foo-bar')).toBe('fooBar'));
  it("camelCase('foo-bar-baz')", () =>
    expect(camelCase('foo-bar-baz')).toBe('fooBarBaz'));
  it("camelCase('foo--bar')", () =>
    expect(camelCase('foo--bar')).toBe('fooBar'));
  it("camelCase('--foo-bar')", () =>
    expect(camelCase('--foo-bar')).toBe('fooBar'));
  it("camelCase('--foo--bar')", () =>
    expect(camelCase('--foo--bar')).toBe('fooBar'));
  it("camelCase('FOO-BAR')", () => expect(camelCase('FOO-BAR')).toBe('fooBar'));
  it("camelCase('FOÈ-BAR')", () => expect(camelCase('FOÈ-BAR')).toBe('foèBar'));
  it("camelCase('-foo-bar-')", () =>
    expect(camelCase('-foo-bar-')).toBe('fooBar'));
  it("camelCase('--foo--bar--')", () =>
    expect(camelCase('--foo--bar--')).toBe('fooBar'));
  it("camelCase('foo.bar')", () => expect(camelCase('foo.bar')).toBe('fooBar'));
  it("camelCase('foo..bar')", () =>
    expect(camelCase('foo..bar')).toBe('fooBar'));
  it("camelCase('..foo..bar..')", () =>
    expect(camelCase('..foo..bar..')).toBe('fooBar'));
  it("camelCase('foo_bar')", () => expect(camelCase('foo_bar')).toBe('fooBar'));
  it("camelCase('__foo__bar__')", () =>
    expect(camelCase('__foo__bar__')).toBe('fooBar'));
  it("camelCase('__foo__bar__')", () =>
    expect(camelCase('__foo__bar__')).toBe('fooBar'));
  it("camelCase('foo bar')", () => expect(camelCase('foo bar')).toBe('fooBar'));
  it("camelCase('  foo  bar  ')", () =>
    expect(camelCase('  foo  bar  ')).toBe('fooBar'));
  it("camelCase('fooBar')", () => expect(camelCase('fooBar')).toBe('fooBar'));
  it("camelCase('fooBar-baz')", () =>
    expect(camelCase('fooBar-baz')).toBe('fooBarBaz'));
  it("camelCase('foìBar-baz')", () =>
    expect(camelCase('foìBar-baz')).toBe('foìBarBaz'));
  it("camelCase('fooBarBaz-bazzy')", () =>
    expect(camelCase('fooBarBaz-bazzy')).toBe('fooBarBazBazzy'));
  it("camelCase('FBBazzy')", () =>
    expect(camelCase('FBBazzy')).toBe('fbBazzy'));
  it("camelCase('F')", () => expect(camelCase('F')).toBe('f'));
  it("camelCase('FooBar')", () => expect(camelCase('FooBar')).toBe('fooBar'));
  it("camelCase('Foo')", () => expect(camelCase('Foo')).toBe('foo'));
  it("camelCase('FOO')", () => expect(camelCase('FOO')).toBe('foo'));
  it("camelCase('foo', 'bar')", () =>
    expect(camelCase('foo', 'bar')).toBe('fooBar'));
  it("camelCase('foo', '-bar')", () =>
    expect(camelCase('foo', '-bar')).toBe('fooBar'));
  it("camelCase('foo', '-bar', 'baz')", () =>
    expect(camelCase('foo', '-bar', 'baz')).toBe('fooBarBaz'));
  it("camelCase('foo bar?')", () =>
    expect(camelCase('foo bar?')).toBe('fooBar?'));
  it("camelCase('foo bar!')", () =>
    expect(camelCase('foo bar!')).toBe('fooBar!'));
  it("camelCase('foo bar$')", () =>
    expect(camelCase('foo bar$')).toBe('fooBar$'));
  it("camelCase('foo-bar#')", () =>
    expect(camelCase('foo-bar#')).toBe('fooBar#'));
  it("camelCase('XMLHttpRequest')", () =>
    expect(camelCase('XMLHttpRequest')).toBe('xmlHttpRequest'));
  it("camelCase('AjaxXMLHttpRequest')", () =>
    expect(camelCase('AjaxXMLHttpRequest')).toBe('ajaxXmlHttpRequest'));
  it("camelCase('Ajax-XMLHttpRequest')", () =>
    expect(camelCase('Ajax-XMLHttpRequest')).toBe('ajaxXmlHttpRequest'));
  it("CamelCase('Ajax-XMLHttpRequest')", () =>
    expect(CamelCase('Ajax-XMLHttpRequest')).toBe('AjaxXmlHttpRequest'));

  it("camelCase('-')", () => expect(camelCase('-')).toBe('-'));
  it("camelCase(' - ')", () => expect(camelCase(' - ')).toBe('-'));
  it("camelCase('', '')", () => expect(camelCase('', '')).toBe(''));
  it("camelCase('--')", () => expect(camelCase('--')).toBe(''));
  it("camelCase('')", () => expect(camelCase('')).toBe(''));
  it("camelCase('--__--_--_')", () => expect(camelCase('--__--_--_')).toBe(''));
  it("camelCase('---_', '--', '', '-_- ')", () =>
    expect(camelCase('---_', '--', '', '-_- ')).toBe(''));
});
