+++
title = "Header Images (AI Style)"
slug = "header-images"
date = 2023-03-20
[taxonomies]
tags = ["infra", "meta"]

[extra]
image_caption="AI Generated Header Images, Pretty Snazzy (Generated with Stable Diffusion + Dreambooth)"
+++

## ~AI Everything~

Operational Update! I'm spicing things up on the blog. All I read on Twitter now is how people generate everything with AI and add it to every project. I've decided to jump on the trend so I can feel included. I've decided to add some header images to my blog. Unless otherwise specified, they will generally be AI-generated (and most should resemble me). How did I do this? I trained a Stable diffusion model using Dreambooth. I had to rent some time on a GPU-for-rent service, and I gave it around 25 pictures of myself. There are plenty of tutorials on this, and I will probably write about it at some point once I dig up my old repos since it was a fun project, but that is outside the scope of this post.

## Meta-Blog Content

This post is about getting Zola to render images. This was pretty easy once I figured out the quirks. First, I added a new directory to my content directory instead of adding a markdown file, as I've done for previous posts. Then, within this directory, I created a main markdown file, `index.md`, and added any static assets to associate with the page to that directory. 

```
header-images/
|-- images
|   |-- main.png
|-- index.md
```

Then I needed to modify my blog post template to render the header images. I decided to go for a very low-effort solution and made the following change to my `blog-page.html` template:

```html
{% for asset in page.assets -%}
<div class="img-wrapper">
  <img src="{{asset}}" />
</div>
<p class="img-caption">{{ page.extra.image_caption }}</p>
{%- endfor %}
```

Walking through this... `page.assets` is provided by Zola and contains all assets in the content directory of the current page. In this case, `page.assets` is `["images/main.png"]`. Which means we'll render an image tag for every asset in this directory. This is not correct for any other use case, but it's good enough for now so long as I ensure there is only one asset per directory (and it's an image.) 

I've been trying to improve my writing with this blog and getting sucked into styling and re-styling is an easy strategy for me to procrastinate from writing, so I limited myself to a very short time period to get header images working. This hacky solution fit into the timebox.

I have also made some scss changes to accomodate this, but I've kept things simple for now. The style sheet for the whole blog as of this writing is as follows:

```scss
$background-color: #f9f5d7;
$link-color: rgb(238, 114, 241);
$font-color: #1d2021;
$code-color: #AAA;

$background-color: $font-color;
$font-color: #F5F5F0;

.icon {
    width: 50px;
    height: 50px;
    fill: white;
    margin: auto;
}

.heading{
    flex-flow: row;
    justify-content: space-between;
}

.profile {
    max-width: 100px;
    width: 100px;
    margin: 15px;
    padding: 5px;
}


.prof-img {
    width: 100%;
    border-width: 3px;
    border-style: solid;
    border-color: $link-color;
}

.heading-one {
    font-family: 'Inconsolata', monospace;
    font-size: 60px;
    font-weight: 900;
    margin-bottom: 0px;
    text-align: center;
    padding: 5px;
    padding-left: 0px;
    padding-right: 0px;
    width: 100%;
    background-color: $font-color;
    color: $background-color;
    margin-top: 5px;
    margin-bottom: 20px;
}

.heading-two {
    font-family: 'Inconsolata', monospace;
    font-size: 30px !important;
    width: 100%;
    padding: 0px;
    margin-top: 0px;
    margin-bottom: 5px;
    margin-right: 0px;
    font-size: 20px;
    overflow: hidden;
    white-space: nowrap;
}

.articles{
    display: flex;
    flex-flow: column;
    .entry{
        margin-top: 2px;
    }
}


p {
    font-family: 'Menlo', monospace;
    
    code {
        color: $code-color;
    }
}

.img-caption{
    color: #AAA; 
    font-size: 12px;
    margin-top: 0px;
}

.img-wrapper {
    border: $link-color 1px solid;
    width: 100%;
    margin-top: 20px;
    margin-bottom: 5px;
        
    img{
        width: 100%;
    }
}

a{
    color:$link-color;
    padding-left: 2px;
    padding-right: 2px;
    &:hover {
        color: $font-color !important;
        background-color: $link-color !important;
    }
}

html{
    background-color: $background-color;
    color: $font-color; 
    font-family: 'Menlo', monospace;
    font-size: 20px;

}

.content-container{
    max-width: 675px;
    position: relative;
    margin: 0 auto;
}

.title{
    margin-bottom: 0px;
}
.subtitle{
    font-size: 16px;
}
```

### Relavent Links

* [Another Software Engineer With a Blog](https://lyon.lol/blog/first-post/)
* [Infrastructure Time](https://lyon.lol/blog/code/)