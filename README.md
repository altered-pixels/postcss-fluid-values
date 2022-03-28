# postcss-fluid-values

[PostCSS] plugin to support fluid transition of property values between breakpoints..

[postcss]: https://github.com/postcss/postcss

## Example

**input**

```css
@fluid (480, 1440) {
  .foo {
    display: block;
    width: 150->300;
    height: ->50->100;
  }

  .bar {
    margin-left: 20->50;
  }
}
```

**output**

```css
.foo {
  display: block;
  width: 150px;
}

.bar {
  margin-left: 20px;
}

@media screen and (min-width: 480px) {
  .foo {
    width: calc(15.625vw + 75px);
    height: calc(5.208333333333334vw + 25px);
  }

  .bar {
    margin-left: calc(3.125vw + 5px);
  }
}

@media screen and (min-width: 1440px) {
  .foo {
    width: 300px;
    height: 100px;
  }

  .bar {
    margin-left: 50px;
  }
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

[official docs]: https://github.com/postcss/postcss#usage
