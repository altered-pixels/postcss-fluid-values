# PostCSS Fluid Values

[PostCSS] plugin to support fluid transition of property values between breakpoints..

[postcss]: https://github.com/postcss/postcss

## Anatomy

```css
.selector {
  /* Viewport-based fluid value */
  property: <min>[ @start]-><max>[@end];

  /* Container-based fluid value */
  property: c(<min>[ @start]-><max>[@end]);
  property: container(<min>[ @start]-><max>[@end]);
}
```

### Parts:

- **`min`:** minimum property value.
- **`max`:** maximum property value.
- **`start`:** viewport/container width at which fluid sizing starts. _(optional)_
- **`end`:** viewport/container width at which fluid sizing ends. _(optional)_

## Example

#### Input

```css
.parent {
  container: parent / inline-size
}

.selector {
  display: block;
  width: 150->300;
  height: 50@480->100@1000;
  padding-top: container(10@300->20@500);
  margin: 0 5px c(10->20);
}
```

#### Output (no defaults)

```css
.parent {
  container: parent / inline-size
}

.selector {
  display: block;
  width: clamp(calc(150 / var(--rem-base, 16) * 1rem), (150 / var(--rem-base, 16) * 1rem) + 150 * ((100vw - (var(--fluid-start, 390) / var(--rem-base, 16) * 1rem)) / (var(--fluid-end, 1440) - var(--fluid-start, 390))), calc(300 / var(--rem-base, 16) * 1rem));
  height: clamp(calc(50 / var(--rem-base, 16) * 1rem), (50 / var(--rem-base, 16) * 1rem) + 50 * ((100vw - (480 / var(--rem-base, 16) * 1rem)) / 520), calc(100 / var(--rem-base, 16) * 1rem));
  padding-top: clamp(calc(10 / var(--rem-base, 16) * 1rem), (10 / var(--rem-base, 16) * 1rem) + 10 * ((100cqi - (300 / var(--rem-base, 16) * 1rem)) / 200), calc(20 / var(--rem-base, 16) * 1rem));
  margin: 0 5px clamp(calc(10 / var(--rem-base, 16) * 1rem), (10 / var(--rem-base, 16) * 1rem) + 10 * ((100cqi - (var(--fluid-container-start, 300) / var(--rem-base, 16) * 1rem)) / (var(--fluid-container-end, 800) - var(--fluid-container-start, 300))), calc(20 / var(--rem-base, 16) * 1rem));
}
```

#### Output (numeric defaults)

```css
.parent {
  container: parent / inline-size
}

.selector {
  display: block;
  width: clamp(15rem, 25vw, 30rem);
  height: clamp(5rem, 9.61538vw + 0.38462rem, 10rem);
  padding-top: clamp(1rem, 5cqi - 0.5rem, 2rem);
  margin: 0 5px clamp(1rem, 1.66667cqi + 0.33333rem, 2rem);
}
```

## Usage

**Step 1:** Install plugin:

```sh
npm install --save-dev postcss postcss-fluid-values
```

**Step 2:** Check you project for existed PostCSS config: `postcss.config.js`
in the project root, `"postcss"` section in `package.json`
or `postcss` in bundle config.

If you do not use PostCSS, add it according to [official docs]
and set this plugin in settings.

**Step 3:** Add the plugin to plugins list:

```diff
module.exports = {
  plugins: [
+   require('postcss-fluid-values'),
    require('autoprefixer')
  ]
}
```

## Options

Call plugin to set options:

```js
require('postcss-fluid-values')({ remBase: 16 })
```

### `remBase`

Type: `Number|String`<br>
Default: `var(--rem-base, 16)`

Number or CSS variable string representing the base font size used for REM calculations (numeric value recommended).

### `start`

Type: `Number|String`<br>
Default: `var(--fluid-start, 390)`

Number or CSS variable string used as the default starting point when no [`start`](#parts) value is explicitly provided (numeric value recommended).

### `end`

Type: `Number|String`<br>
Default: `var(--fluid-end, 1440)`

Number or CSS variable string used as the default ending point when no [`end`](#parts) value is explicitly provided (numeric value recommended).

### `containerStart`

Type: `Number|String`<br>
Default: `var(--fluid-container-start, 300)`

Number or CSS variable string used as the default starting point for container-based values when no [`start`](#parts) value is explicitly provided (numeric value recommended).

### `containerEnd`

Type: `Number|String`

Default: `var(--fluid-end, 1440)`

Number or CSS variable string used as the default ending point for container-based values when no [`end`](#parts) value is explicitly provided (numeric value recommended).

[official docs]: https://github.com/postcss/postcss#usage
