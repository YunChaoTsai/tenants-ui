# Icons

---

Icons used for our applications. We are using svgs for icons.

## Usage

```typescript
import PhoneIcon from "<path>/Shared/Icons/PhoneIcon"
// import { PhoneIcon } from "<path>/Shared/Icons"

function MyComponent() {
  return (
    <div>
      <PhoneIcon title="Call to John doe" />
    </div>
  )
}
```

## Contribution

1. Generating SVGs
   Head over to https://icomoon.io/app and choose icon(s). After selecting icon(s), click on `Generate SVG & More` from
   bottom navigation. From this view, download the svgs and paste the content of <downloaded_folder>/SVG into the
   `./svgs` folder. Append the styles from <downloaded_folder>/styles.css to `./icon.css`.

2. Create an icon component
   > e.g. ./PhoneIcon.tsx

```typescript
import { ReactComponent as Phone } from "./svgs/phone.svg"
import icon from "./Icon"
export default icon(Phone, "phone")
```

3. Add an export entry inside `./index.tsx` for each import
   > ./index.tsx

```typescript
import PhoneIcon from "./PhoneIcon"

export { PhoneIcon }
```
