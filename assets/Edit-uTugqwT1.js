const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/quill-Cy_hvSCZ.js","assets/_commonjsHelpers-BosuxZz1.js"])))=>i.map(i=>d[i]);
import{ek as te,o as p,b,a as l,eo as oe,en as a,eu as re,ev as ie,ew as ae,ex as se,ey as de,h as r,F as S,es as W,w as d,r as E,g as c,k as qe,j as ce,ez as pe,t as w,ej as ue,eA as be,c as G,eB as fe}from"./index-CHYLfzHD.js";import{s as me}from"./index-BvbF8nps.js";import{s as ve}from"./index-BXg-FrGO.js";import{s as ke}from"./index-BS6JwQTQ.js";import{s as we,a as xe,b as ge,c as he}from"./index-Duk1CTth.js";import{s as ye}from"./index-BhyxTzkF.js";import"./index-C-87dzQd.js";import"./index-B9QHzmqI.js";import"./index-DytnnxE3.js";import"./index-BNAW-5ZH.js";var Ve=`
    /*!
* Quill Editor v1.3.3
* https://quilljs.com/
* Copyright (c) 2014, Jason Chen
* Copyright (c) 2013, salesforce.com
*/
    .ql-container {
        box-sizing: border-box;
        font-family: Helvetica, Arial, sans-serif;
        font-size: 13px;
        height: 100%;
        margin: 0;
        position: relative;
    }
    .ql-container.ql-disabled .ql-tooltip {
        visibility: hidden;
    }
    .ql-container.ql-disabled .ql-editor ul[data-checked] > li::before {
        pointer-events: none;
    }
    .ql-clipboard {
        inset-inline-start: -100000px;
        height: 1px;
        overflow-y: hidden;
        position: absolute;
        top: 50%;
    }
    .ql-clipboard p {
        margin: 0;
        padding: 0;
    }
    .ql-editor {
        box-sizing: border-box;
        line-height: 1.42;
        height: 100%;
        outline: none;
        overflow-y: auto;
        padding: 12px 15px;
        tab-size: 4;
        -moz-tab-size: 4;
        text-align: left;
        white-space: pre-wrap;
        word-wrap: break-word;
    }
    .ql-editor > * {
        cursor: text;
    }
    .ql-editor p,
    .ql-editor ol,
    .ql-editor ul,
    .ql-editor pre,
    .ql-editor blockquote,
    .ql-editor h1,
    .ql-editor h2,
    .ql-editor h3,
    .ql-editor h4,
    .ql-editor h5,
    .ql-editor h6 {
        margin: 0;
        padding: 0;
        counter-reset: list-1 list-2 list-3 list-4 list-5 list-6 list-7 list-8 list-9;
    }
    .ql-editor ol,
    .ql-editor ul {
        padding-inline-start: 1.5rem;
    }
    .ql-editor ol > li,
    .ql-editor ul > li {
        list-style-type: none;
    }
    .ql-editor ul > li::before {
        content: '\\2022';
    }
    .ql-editor ul[data-checked='true'],
    .ql-editor ul[data-checked='false'] {
        pointer-events: none;
    }
    .ql-editor ul[data-checked='true'] > li *,
    .ql-editor ul[data-checked='false'] > li * {
        pointer-events: all;
    }
    .ql-editor ul[data-checked='true'] > li::before,
    .ql-editor ul[data-checked='false'] > li::before {
        color: #777;
        cursor: pointer;
        pointer-events: all;
    }
    .ql-editor ul[data-checked='true'] > li::before {
        content: '\\2611';
    }
    .ql-editor ul[data-checked='false'] > li::before {
        content: '\\2610';
    }
    .ql-editor li::before {
        display: inline-block;
        white-space: nowrap;
        width: 1.2rem;
    }
    .ql-editor li:not(.ql-direction-rtl)::before {
        margin-inline-start: -1.5rem;
        margin-inline-end: 0.3rem;
        text-align: right;
    }
    .ql-editor li.ql-direction-rtl::before {
        margin-inline-start: 0.3rem;
        margin-inline-end: -1.5rem;
    }
    .ql-editor ol li:not(.ql-direction-rtl),
    .ql-editor ul li:not(.ql-direction-rtl) {
        padding-inline-start: 1.5rem;
    }
    .ql-editor ol li.ql-direction-rtl,
    .ql-editor ul li.ql-direction-rtl {
        padding-inline-end: 1.5rem;
    }
    .ql-editor ol li {
        counter-reset: list-1 list-2 list-3 list-4 list-5 list-6 list-7 list-8 list-9;
        counter-increment: list-0;
    }
    .ql-editor ol li:before {
        content: counter(list-0, decimal) '. ';
    }
    .ql-editor ol li.ql-indent-1 {
        counter-increment: list-1;
    }
    .ql-editor ol li.ql-indent-1:before {
        content: counter(list-1, lower-alpha) '. ';
    }
    .ql-editor ol li.ql-indent-1 {
        counter-reset: list-2 list-3 list-4 list-5 list-6 list-7 list-8 list-9;
    }
    .ql-editor ol li.ql-indent-2 {
        counter-increment: list-2;
    }
    .ql-editor ol li.ql-indent-2:before {
        content: counter(list-2, lower-roman) '. ';
    }
    .ql-editor ol li.ql-indent-2 {
        counter-reset: list-3 list-4 list-5 list-6 list-7 list-8 list-9;
    }
    .ql-editor ol li.ql-indent-3 {
        counter-increment: list-3;
    }
    .ql-editor ol li.ql-indent-3:before {
        content: counter(list-3, decimal) '. ';
    }
    .ql-editor ol li.ql-indent-3 {
        counter-reset: list-4 list-5 list-6 list-7 list-8 list-9;
    }
    .ql-editor ol li.ql-indent-4 {
        counter-increment: list-4;
    }
    .ql-editor ol li.ql-indent-4:before {
        content: counter(list-4, lower-alpha) '. ';
    }
    .ql-editor ol li.ql-indent-4 {
        counter-reset: list-5 list-6 list-7 list-8 list-9;
    }
    .ql-editor ol li.ql-indent-5 {
        counter-increment: list-5;
    }
    .ql-editor ol li.ql-indent-5:before {
        content: counter(list-5, lower-roman) '. ';
    }
    .ql-editor ol li.ql-indent-5 {
        counter-reset: list-6 list-7 list-8 list-9;
    }
    .ql-editor ol li.ql-indent-6 {
        counter-increment: list-6;
    }
    .ql-editor ol li.ql-indent-6:before {
        content: counter(list-6, decimal) '. ';
    }
    .ql-editor ol li.ql-indent-6 {
        counter-reset: list-7 list-8 list-9;
    }
    .ql-editor ol li.ql-indent-7 {
        counter-increment: list-7;
    }
    .ql-editor ol li.ql-indent-7:before {
        content: counter(list-7, lower-alpha) '. ';
    }
    .ql-editor ol li.ql-indent-7 {
        counter-reset: list-8 list-9;
    }
    .ql-editor ol li.ql-indent-8 {
        counter-increment: list-8;
    }
    .ql-editor ol li.ql-indent-8:before {
        content: counter(list-8, lower-roman) '. ';
    }
    .ql-editor ol li.ql-indent-8 {
        counter-reset: list-9;
    }
    .ql-editor ol li.ql-indent-9 {
        counter-increment: list-9;
    }
    .ql-editor ol li.ql-indent-9:before {
        content: counter(list-9, decimal) '. ';
    }
    .ql-editor .ql-video {
        display: block;
        max-width: 100%;
    }
    .ql-editor .ql-video.ql-align-center {
        margin: 0 auto;
    }
    .ql-editor .ql-video.ql-align-right {
        margin: 0 0 0 auto;
    }
    .ql-editor .ql-bg-black {
        background: #000;
    }
    .ql-editor .ql-bg-red {
        background: #e60000;
    }
    .ql-editor .ql-bg-orange {
        background: #f90;
    }
    .ql-editor .ql-bg-yellow {
        background: #ff0;
    }
    .ql-editor .ql-bg-green {
        background: #008a00;
    }
    .ql-editor .ql-bg-blue {
        background: #06c;
    }
    .ql-editor .ql-bg-purple {
        background: #93f;
    }
    .ql-editor .ql-color-white {
        color: #fff;
    }
    .ql-editor .ql-color-red {
        color: #e60000;
    }
    .ql-editor .ql-color-orange {
        color: #f90;
    }
    .ql-editor .ql-color-yellow {
        color: #ff0;
    }
    .ql-editor .ql-color-green {
        color: #008a00;
    }
    .ql-editor .ql-color-blue {
        color: #06c;
    }
    .ql-editor .ql-color-purple {
        color: #93f;
    }
    .ql-editor .ql-font-serif {
        font-family:
            Georgia,
            Times New Roman,
            serif;
    }
    .ql-editor .ql-font-monospace {
        font-family:
            Monaco,
            Courier New,
            monospace;
    }
    .ql-editor .ql-size-small {
        font-size: 0.75rem;
    }
    .ql-editor .ql-size-large {
        font-size: 1.5rem;
    }
    .ql-editor .ql-size-huge {
        font-size: 2.5rem;
    }
    .ql-editor .ql-direction-rtl {
        direction: rtl;
        text-align: inherit;
    }
    .ql-editor .ql-align-center {
        text-align: center;
    }
    .ql-editor .ql-align-justify {
        text-align: justify;
    }
    .ql-editor .ql-align-right {
        text-align: right;
    }
    .ql-editor.ql-blank::before {
        color: dt('form.field.placeholder.color');
        content: attr(data-placeholder);
        font-style: italic;
        inset-inline-start: 15px;
        pointer-events: none;
        position: absolute;
        inset-inline-end: 15px;
    }
    .ql-snow.ql-toolbar:after,
    .ql-snow .ql-toolbar:after {
        clear: both;
        content: '';
        display: table;
    }
    .ql-snow.ql-toolbar button,
    .ql-snow .ql-toolbar button {
        background: none;
        border: none;
        cursor: pointer;
        display: inline-block;
        float: left;
        height: 24px;
        padding-block: 3px;
        padding-inline: 5px;
        width: 28px;
    }
    .ql-snow.ql-toolbar button svg,
    .ql-snow .ql-toolbar button svg {
        float: left;
        height: 100%;
    }
    .ql-snow.ql-toolbar button:active:hover,
    .ql-snow .ql-toolbar button:active:hover {
        outline: none;
    }
    .ql-snow.ql-toolbar input.ql-image[type='file'],
    .ql-snow .ql-toolbar input.ql-image[type='file'] {
        display: none;
    }
    .ql-snow.ql-toolbar button:hover,
    .ql-snow .ql-toolbar button:hover,
    .ql-snow.ql-toolbar button:focus,
    .ql-snow .ql-toolbar button:focus,
    .ql-snow.ql-toolbar button.ql-active,
    .ql-snow .ql-toolbar button.ql-active,
    .ql-snow.ql-toolbar .ql-picker-label:hover,
    .ql-snow .ql-toolbar .ql-picker-label:hover,
    .ql-snow.ql-toolbar .ql-picker-label.ql-active,
    .ql-snow .ql-toolbar .ql-picker-label.ql-active,
    .ql-snow.ql-toolbar .ql-picker-item:hover,
    .ql-snow .ql-toolbar .ql-picker-item:hover,
    .ql-snow.ql-toolbar .ql-picker-item.ql-selected,
    .ql-snow .ql-toolbar .ql-picker-item.ql-selected {
        color: #06c;
    }
    .ql-snow.ql-toolbar button:hover .ql-fill,
    .ql-snow .ql-toolbar button:hover .ql-fill,
    .ql-snow.ql-toolbar button:focus .ql-fill,
    .ql-snow .ql-toolbar button:focus .ql-fill,
    .ql-snow.ql-toolbar button.ql-active .ql-fill,
    .ql-snow .ql-toolbar button.ql-active .ql-fill,
    .ql-snow.ql-toolbar .ql-picker-label:hover .ql-fill,
    .ql-snow .ql-toolbar .ql-picker-label:hover .ql-fill,
    .ql-snow.ql-toolbar .ql-picker-label.ql-active .ql-fill,
    .ql-snow .ql-toolbar .ql-picker-label.ql-active .ql-fill,
    .ql-snow.ql-toolbar .ql-picker-item:hover .ql-fill,
    .ql-snow .ql-toolbar .ql-picker-item:hover .ql-fill,
    .ql-snow.ql-toolbar .ql-picker-item.ql-selected .ql-fill,
    .ql-snow .ql-toolbar .ql-picker-item.ql-selected .ql-fill,
    .ql-snow.ql-toolbar button:hover .ql-stroke.ql-fill,
    .ql-snow .ql-toolbar button:hover .ql-stroke.ql-fill,
    .ql-snow.ql-toolbar button:focus .ql-stroke.ql-fill,
    .ql-snow .ql-toolbar button:focus .ql-stroke.ql-fill,
    .ql-snow.ql-toolbar button.ql-active .ql-stroke.ql-fill,
    .ql-snow .ql-toolbar button.ql-active .ql-stroke.ql-fill,
    .ql-snow.ql-toolbar .ql-picker-label:hover .ql-stroke.ql-fill,
    .ql-snow .ql-toolbar .ql-picker-label:hover .ql-stroke.ql-fill,
    .ql-snow.ql-toolbar .ql-picker-label.ql-active .ql-stroke.ql-fill,
    .ql-snow .ql-toolbar .ql-picker-label.ql-active .ql-stroke.ql-fill,
    .ql-snow.ql-toolbar .ql-picker-item:hover .ql-stroke.ql-fill,
    .ql-snow .ql-toolbar .ql-picker-item:hover .ql-stroke.ql-fill,
    .ql-snow.ql-toolbar .ql-picker-item.ql-selected .ql-stroke.ql-fill,
    .ql-snow .ql-toolbar .ql-picker-item.ql-selected .ql-stroke.ql-fill {
        fill: #06c;
    }
    .ql-snow.ql-toolbar button:hover .ql-stroke,
    .ql-snow .ql-toolbar button:hover .ql-stroke,
    .ql-snow.ql-toolbar button:focus .ql-stroke,
    .ql-snow .ql-toolbar button:focus .ql-stroke,
    .ql-snow.ql-toolbar button.ql-active .ql-stroke,
    .ql-snow .ql-toolbar button.ql-active .ql-stroke,
    .ql-snow.ql-toolbar .ql-picker-label:hover .ql-stroke,
    .ql-snow .ql-toolbar .ql-picker-label:hover .ql-stroke,
    .ql-snow.ql-toolbar .ql-picker-label.ql-active .ql-stroke,
    .ql-snow .ql-toolbar .ql-picker-label.ql-active .ql-stroke,
    .ql-snow.ql-toolbar .ql-picker-item:hover .ql-stroke,
    .ql-snow .ql-toolbar .ql-picker-item:hover .ql-stroke,
    .ql-snow.ql-toolbar .ql-picker-item.ql-selected .ql-stroke,
    .ql-snow .ql-toolbar .ql-picker-item.ql-selected .ql-stroke,
    .ql-snow.ql-toolbar button:hover .ql-stroke-miter,
    .ql-snow .ql-toolbar button:hover .ql-stroke-miter,
    .ql-snow.ql-toolbar button:focus .ql-stroke-miter,
    .ql-snow .ql-toolbar button:focus .ql-stroke-miter,
    .ql-snow.ql-toolbar button.ql-active .ql-stroke-miter,
    .ql-snow.ql-toolbar button.ql-active .ql-stroke-miter,
    .ql-snow.ql-toolbar .ql-picker-label:hover .ql-stroke-miter,
    .ql-snow .ql-toolbar .ql-picker-label:hover .ql-stroke-miter,
    .ql-snow.ql-toolbar .ql-picker-label.ql-active .ql-stroke-miter,
    .ql-snow .ql-toolbar .ql-picker-label.ql-active .ql-stroke-miter,
    .ql-snow.ql-toolbar .ql-picker-item:hover .ql-stroke-miter,
    .ql-snow .ql-toolbar .ql-picker-item:hover .ql-stroke-miter,
    .ql-snow.ql-toolbar .ql-picker-item.ql-selected .ql-stroke-miter,
    .ql-snow .ql-toolbar .ql-picker-item.ql-selected .ql-stroke-miter {
        stroke: #06c;
    }
    @media (pointer: coarse) {
        .ql-snow.ql-toolbar button:hover:not(.ql-active),
        .ql-snow .ql-toolbar button:hover:not(.ql-active) {
            color: #444;
        }
        .ql-snow.ql-toolbar button:hover:not(.ql-active) .ql-fill,
        .ql-snow .ql-toolbar button:hover:not(.ql-active) .ql-fill,
        .ql-snow.ql-toolbar button:hover:not(.ql-active) .ql-stroke.ql-fill,
        .ql-snow .ql-toolbar button:hover:not(.ql-active) .ql-stroke.ql-fill {
            fill: #444;
        }
        .ql-snow.ql-toolbar button:hover:not(.ql-active) .ql-stroke,
        .ql-snow .ql-toolbar button:hover:not(.ql-active) .ql-stroke,
        .ql-snow.ql-toolbar button:hover:not(.ql-active) .ql-stroke-miter,
        .ql-snow .ql-toolbar button:hover:not(.ql-active) .ql-stroke-miter {
            stroke: #444;
        }
    }
    .ql-snow {
        box-sizing: border-box;
    }
    .ql-snow * {
        box-sizing: border-box;
    }
    .ql-snow .ql-hidden {
        display: none;
    }
    .ql-snow .ql-out-bottom,
    .ql-snow .ql-out-top {
        visibility: hidden;
    }
    .ql-snow .ql-tooltip {
        position: absolute;
        transform: translateY(10px);
    }
    .ql-snow .ql-tooltip a {
        cursor: pointer;
        text-decoration: none;
    }
    .ql-snow .ql-tooltip.ql-flip {
        transform: translateY(-10px);
    }
    .ql-snow .ql-formats {
        display: inline-block;
        vertical-align: middle;
    }
    .ql-snow .ql-formats:after {
        clear: both;
        content: '';
        display: table;
    }
    .ql-snow .ql-stroke {
        fill: none;
        stroke: #444;
        stroke-linecap: round;
        stroke-linejoin: round;
        stroke-width: 2;
    }
    .ql-snow .ql-stroke-miter {
        fill: none;
        stroke: #444;
        stroke-miterlimit: 10;
        stroke-width: 2;
    }
    .ql-snow .ql-fill,
    .ql-snow .ql-stroke.ql-fill {
        fill: #444;
    }
    .ql-snow .ql-empty {
        fill: none;
    }
    .ql-snow .ql-even {
        fill-rule: evenodd;
    }
    .ql-snow .ql-thin,
    .ql-snow .ql-stroke.ql-thin {
        stroke-width: 1;
    }
    .ql-snow .ql-transparent {
        opacity: 0.4;
    }
    .ql-snow .ql-direction svg:last-child {
        display: none;
    }
    .ql-snow .ql-direction.ql-active svg:last-child {
        display: inline;
    }
    .ql-snow .ql-direction.ql-active svg:first-child {
        display: none;
    }
    .ql-snow .ql-editor h1 {
        font-size: 2rem;
    }
    .ql-snow .ql-editor h2 {
        font-size: 1.5rem;
    }
    .ql-snow .ql-editor h3 {
        font-size: 1.17rem;
    }
    .ql-snow .ql-editor h4 {
        font-size: 1rem;
    }
    .ql-snow .ql-editor h5 {
        font-size: 0.83rem;
    }
    .ql-snow .ql-editor h6 {
        font-size: 0.67rem;
    }
    .ql-snow .ql-editor a {
        text-decoration: underline;
    }
    .ql-snow .ql-editor blockquote {
        border-inline-start: 4px solid #ccc;
        margin-block-end: 5px;
        margin-block-start: 5px;
        padding-inline-start: 16px;
    }
    .ql-snow .ql-editor code,
    .ql-snow .ql-editor pre {
        background: #f0f0f0;
        border-radius: 3px;
    }
    .ql-snow .ql-editor pre {
        white-space: pre-wrap;
        margin-block-end: 5px;
        margin-block-start: 5px;
        padding: 5px 10px;
    }
    .ql-snow .ql-editor code {
        font-size: 85%;
        padding: 2px 4px;
    }
    .ql-snow .ql-editor pre.ql-syntax {
        background: #23241f;
        color: #f8f8f2;
        overflow: visible;
    }
    .ql-snow .ql-editor img {
        max-width: 100%;
    }
    .ql-snow .ql-picker {
        color: #444;
        display: inline-block;
        float: left;
        inset-inline-start: 0;
        font-size: 14px;
        font-weight: 500;
        height: 24px;
        position: relative;
        vertical-align: middle;
    }
    .ql-snow .ql-picker-label {
        cursor: pointer;
        display: inline-block;
        height: 100%;
        padding-inline-start: 8px;
        padding-inline-end: 2px;
        position: relative;
        width: 100%;
    }
    .ql-snow .ql-picker-label::before {
        display: inline-block;
        line-height: 22px;
    }
    .ql-snow .ql-picker-options {
        background: #fff;
        display: none;
        min-width: 100%;
        padding: 4px 8px;
        position: absolute;
        white-space: nowrap;
    }
    .ql-snow .ql-picker-options .ql-picker-item {
        cursor: pointer;
        display: block;
        padding-block-end: 5px;
        padding-block-start: 5px;
    }
    .ql-snow .ql-picker.ql-expanded .ql-picker-label {
        color: #ccc;
        z-index: 2;
    }
    .ql-snow .ql-picker.ql-expanded .ql-picker-label .ql-fill {
        fill: #ccc;
    }
    .ql-snow .ql-picker.ql-expanded .ql-picker-label .ql-stroke {
        stroke: #ccc;
    }
    .ql-snow .ql-picker.ql-expanded .ql-picker-options {
        display: block;
        margin-block-start: -1px;
        top: 100%;
        z-index: 1;
    }
    .ql-snow .ql-color-picker,
    .ql-snow .ql-icon-picker {
        width: 28px;
    }
    .ql-snow .ql-color-picker .ql-picker-label,
    .ql-snow .ql-icon-picker .ql-picker-label {
        padding: 2px 4px;
    }
    .ql-snow .ql-color-picker .ql-picker-label svg,
    .ql-snow .ql-icon-picker .ql-picker-label svg {
        inset-inline-end: 4px;
    }
    .ql-snow .ql-icon-picker .ql-picker-options {
        padding: 4px 0;
    }
    .ql-snow .ql-icon-picker .ql-picker-item {
        height: 24px;
        width: 24px;
        padding: 2px 4px;
    }
    .ql-snow .ql-color-picker .ql-picker-options {
        padding: 3px 5px;
        width: 152px;
    }
    .ql-snow .ql-color-picker .ql-picker-item {
        border: 1px solid transparent;
        float: left;
        height: 16px;
        margin: 2px;
        padding: 0;
        width: 16px;
    }
    .ql-snow .ql-picker:not(.ql-color-picker):not(.ql-icon-picker) svg {
        position: absolute;
        margin-block-start: -9px;
        inset-inline-end: 0;
        top: 50%;
        width: 18px;
    }
    .ql-snow .ql-picker.ql-header .ql-picker-label[data-label]:not([data-label=''])::before,
    .ql-snow .ql-picker.ql-font .ql-picker-label[data-label]:not([data-label=''])::before,
    .ql-snow .ql-picker.ql-size .ql-picker-label[data-label]:not([data-label=''])::before,
    .ql-snow .ql-picker.ql-header .ql-picker-item[data-label]:not([data-label=''])::before,
    .ql-snow .ql-picker.ql-font .ql-picker-item[data-label]:not([data-label=''])::before,
    .ql-snow .ql-picker.ql-size .ql-picker-item[data-label]:not([data-label=''])::before {
        content: attr(data-label);
    }
    .ql-snow .ql-picker.ql-header {
        width: 98px;
    }
    .ql-snow .ql-picker.ql-header .ql-picker-label::before,
    .ql-snow .ql-picker.ql-header .ql-picker-item::before {
        content: 'Normal';
    }
    .ql-snow .ql-picker.ql-header .ql-picker-label[data-value='1']::before,
    .ql-snow .ql-picker.ql-header .ql-picker-item[data-value='1']::before {
        content: 'Heading 1';
    }
    .ql-snow .ql-picker.ql-header .ql-picker-label[data-value='2']::before,
    .ql-snow .ql-picker.ql-header .ql-picker-item[data-value='2']::before {
        content: 'Heading 2';
    }
    .ql-snow .ql-picker.ql-header .ql-picker-label[data-value='3']::before,
    .ql-snow .ql-picker.ql-header .ql-picker-item[data-value='3']::before {
        content: 'Heading 3';
    }
    .ql-snow .ql-picker.ql-header .ql-picker-label[data-value='4']::before,
    .ql-snow .ql-picker.ql-header .ql-picker-item[data-value='4']::before {
        content: 'Heading 4';
    }
    .ql-snow .ql-picker.ql-header .ql-picker-label[data-value='5']::before,
    .ql-snow .ql-picker.ql-header .ql-picker-item[data-value='5']::before {
        content: 'Heading 5';
    }
    .ql-snow .ql-picker.ql-header .ql-picker-label[data-value='6']::before,
    .ql-snow .ql-picker.ql-header .ql-picker-item[data-value='6']::before {
        content: 'Heading 6';
    }
    .ql-snow .ql-picker.ql-header .ql-picker-item[data-value='1']::before {
        font-size: 2rem;
    }
    .ql-snow .ql-picker.ql-header .ql-picker-item[data-value='2']::before {
        font-size: 1.5rem;
    }
    .ql-snow .ql-picker.ql-header .ql-picker-item[data-value='3']::before {
        font-size: 1.17rem;
    }
    .ql-snow .ql-picker.ql-header .ql-picker-item[data-value='4']::before {
        font-size: 1rem;
    }
    .ql-snow .ql-picker.ql-header .ql-picker-item[data-value='5']::before {
        font-size: 0.83rem;
    }
    .ql-snow .ql-picker.ql-header .ql-picker-item[data-value='6']::before {
        font-size: 0.67rem;
    }
    .ql-snow .ql-picker.ql-font {
        width: 108px;
    }
    .ql-snow .ql-picker.ql-font .ql-picker-label::before,
    .ql-snow .ql-picker.ql-font .ql-picker-item::before {
        content: 'Sans Serif';
    }
    .ql-snow .ql-picker.ql-font .ql-picker-label[data-value='serif']::before,
    .ql-snow .ql-picker.ql-font .ql-picker-item[data-value='serif']::before {
        content: 'Serif';
    }
    .ql-snow .ql-picker.ql-font .ql-picker-label[data-value='monospace']::before,
    .ql-snow .ql-picker.ql-font .ql-picker-item[data-value='monospace']::before {
        content: 'Monospace';
    }
    .ql-snow .ql-picker.ql-font .ql-picker-item[data-value='serif']::before {
        font-family:
            Georgia,
            Times New Roman,
            serif;
    }
    .ql-snow .ql-picker.ql-font .ql-picker-item[data-value='monospace']::before {
        font-family:
            Monaco,
            Courier New,
            monospace;
    }
    .ql-snow .ql-picker.ql-size {
        width: 98px;
    }
    .ql-snow .ql-picker.ql-size .ql-picker-label::before,
    .ql-snow .ql-picker.ql-size .ql-picker-item::before {
        content: 'Normal';
    }
    .ql-snow .ql-picker.ql-size .ql-picker-label[data-value='small']::before,
    .ql-snow .ql-picker.ql-size .ql-picker-item[data-value='small']::before {
        content: 'Small';
    }
    .ql-snow .ql-picker.ql-size .ql-picker-label[data-value='large']::before,
    .ql-snow .ql-picker.ql-size .ql-picker-item[data-value='large']::before {
        content: 'Large';
    }
    .ql-snow .ql-picker.ql-size .ql-picker-label[data-value='huge']::before,
    .ql-snow .ql-picker.ql-size .ql-picker-item[data-value='huge']::before {
        content: 'Huge';
    }
    .ql-snow .ql-picker.ql-size .ql-picker-item[data-value='small']::before {
        font-size: 10px;
    }
    .ql-snow .ql-picker.ql-size .ql-picker-item[data-value='large']::before {
        font-size: 18px;
    }
    .ql-snow .ql-picker.ql-size .ql-picker-item[data-value='huge']::before {
        font-size: 32px;
    }
    .ql-snow .ql-color-picker.ql-background .ql-picker-item {
        background: #fff;
    }
    .ql-snow .ql-color-picker.ql-color .ql-picker-item {
        background: #000;
    }
    .ql-toolbar.ql-snow {
        border: 1px solid #ccc;
        box-sizing: border-box;
        font-family: 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif;
        padding: 8px;
    }
    .ql-toolbar.ql-snow .ql-formats {
        margin-inline-end: 15px;
    }
    .ql-toolbar.ql-snow .ql-picker-label {
        border: 1px solid transparent;
    }
    .ql-toolbar.ql-snow .ql-picker-options {
        border: 1px solid transparent;
        box-shadow: rgba(0, 0, 0, 0.2) 0 2px 8px;
    }
    .ql-toolbar.ql-snow .ql-picker.ql-expanded .ql-picker-label {
        border-color: #ccc;
    }
    .ql-toolbar.ql-snow .ql-picker.ql-expanded .ql-picker-options {
        border-color: #ccc;
    }
    .ql-toolbar.ql-snow .ql-color-picker .ql-picker-item.ql-selected,
    .ql-toolbar.ql-snow .ql-color-picker .ql-picker-item:hover {
        border-color: #000;
    }
    .ql-toolbar.ql-snow + .ql-container.ql-snow {
        border-block-start: 0;
    }
    .ql-snow .ql-tooltip {
        background: #fff;
        border: 1px solid #ccc;
        box-shadow: 0 0 5px #ddd;
        color: #444;
        padding: 5px 12px;
        white-space: nowrap;
    }
    .ql-snow .ql-tooltip::before {
        content: 'Visit URL:';
        line-height: 26px;
        margin-inline-end: 8px;
    }
    .ql-snow .ql-tooltip input[type='text'] {
        display: none;
        border: 1px solid #ccc;
        font-size: 13px;
        height: 26px;
        margin: 0;
        padding: 3px 5px;
        width: 170px;
    }
    .ql-snow .ql-tooltip a.ql-preview {
        display: inline-block;
        max-width: 200px;
        overflow-x: hidden;
        text-overflow: ellipsis;
        vertical-align: top;
    }
    .ql-snow .ql-tooltip a.ql-action::after {
        border-inline-end: 1px solid #ccc;
        content: 'Edit';
        margin-inline-start: 16px;
        padding-inline-end: 8px;
    }
    .ql-snow .ql-tooltip a.ql-remove::before {
        content: 'Remove';
        margin-inline-start: 8px;
    }
    .ql-snow .ql-tooltip a {
        line-height: 26px;
    }
    .ql-snow .ql-tooltip.ql-editing a.ql-preview,
    .ql-snow .ql-tooltip.ql-editing a.ql-remove {
        display: none;
    }
    .ql-snow .ql-tooltip.ql-editing input[type='text'] {
        display: inline-block;
    }
    .ql-snow .ql-tooltip.ql-editing a.ql-action::after {
        border-inline-end: 0;
        content: 'Save';
        padding-inline-end: 0;
    }
    .ql-snow .ql-tooltip[data-mode='link']::before {
        content: 'Enter link:';
    }
    .ql-snow .ql-tooltip[data-mode='formula']::before {
        content: 'Enter formula:';
    }
    .ql-snow .ql-tooltip[data-mode='video']::before {
        content: 'Enter video:';
    }
    .ql-snow a {
        color: #06c;
    }
    .ql-container.ql-snow {
        border: 1px solid #ccc;
    }

    .p-editor {
        display: block;
    }

    .p-editor .p-editor-toolbar {
        background: dt('editor.toolbar.background');
        border-start-end-radius: dt('editor.toolbar.border.radius');
        border-start-start-radius: dt('editor.toolbar.border.radius');
    }

    .p-editor .p-editor-toolbar.ql-snow {
        border: 1px solid dt('editor.toolbar.border.color');
    }

    .p-editor .p-editor-toolbar.ql-snow .ql-stroke {
        stroke: dt('editor.toolbar.item.color');
    }

    .p-editor .p-editor-toolbar.ql-snow .ql-fill {
        fill: dt('editor.toolbar.item.color');
    }

    .p-editor .p-editor-toolbar.ql-snow .ql-picker .ql-picker-label {
        border: 0 none;
        color: dt('editor.toolbar.item.color');
    }

    .p-editor .p-editor-toolbar.ql-snow .ql-picker .ql-picker-label:hover {
        color: dt('editor.toolbar.item.hover.color');
    }

    .p-editor .p-editor-toolbar.ql-snow .ql-picker .ql-picker-label:hover .ql-stroke {
        stroke: dt('editor.toolbar.item.hover.color');
    }

    .p-editor .p-editor-toolbar.ql-snow .ql-picker .ql-picker-label:hover .ql-fill {
        fill: dt('editor.toolbar.item.hover.color');
    }

    .p-editor .p-editor-toolbar.ql-snow .ql-picker.ql-expanded .ql-picker-label {
        color: dt('editor.toolbar.item.active.color');
    }

    .p-editor .p-editor-toolbar.ql-snow .ql-picker.ql-expanded .ql-picker-label .ql-stroke {
        stroke: dt('editor.toolbar.item.active.color');
    }

    .p-editor .p-editor-toolbar.ql-snow .ql-picker.ql-expanded .ql-picker-label .ql-fill {
        fill: dt('editor.toolbar.item.active.color');
    }

    .p-editor .p-editor-toolbar.ql-snow .ql-picker.ql-expanded .ql-picker-options {
        background: dt('editor.overlay.background');
        border: 1px solid dt('editor.overlay.border.color');
        box-shadow: dt('editor.overlay.shadow');
        border-radius: dt('editor.overlay.border.radius');
        padding: dt('editor.overlay.padding');
    }

    .p-editor .p-editor-toolbar.ql-snow .ql-picker.ql-expanded .ql-picker-options .ql-picker-item {
        color: dt('editor.overlay.option.color');
        border-radius: dt('editor.overlay.option.border.radius');
    }

    .p-editor .p-editor-toolbar.ql-snow .ql-picker.ql-expanded .ql-picker-options .ql-picker-item:hover {
        background: dt('editor.overlay.option.focus.background');
        color: dt('editor.overlay.option.focus.color');
    }

    .p-editor .p-editor-toolbar.ql-snow .ql-picker.ql-expanded:not(.ql-color-picker, .ql-icon-picker) .ql-picker-item {
        padding: dt('editor.overlay.option.padding');
    }

    .p-editor .p-editor-content {
        border-end-end-radius: dt('editor.content.border.radius');
        border-end-start-radius: dt('editor.content.border.radius');
    }

    .p-editor .p-editor-content.ql-snow {
        border: 1px solid dt('editor.content.border.color');
    }

    .p-editor .p-editor-content .ql-editor {
        background: dt('editor.content.background');
        color: dt('editor.content.color');
        border-end-end-radius: dt('editor.content.border.radius');
        border-end-start-radius: dt('editor.content.border.radius');
    }

    .p-editor .ql-snow.ql-toolbar button:hover,
    .p-editor .ql-snow.ql-toolbar button:focus {
        color: dt('editor.toolbar.item.hover.color');
    }

    .p-editor .ql-snow.ql-toolbar button:hover .ql-stroke,
    .p-editor .ql-snow.ql-toolbar button:focus .ql-stroke {
        stroke: dt('editor.toolbar.item.hover.color');
    }

    .p-editor .ql-snow.ql-toolbar button:hover .ql-fill,
    .p-editor .ql-snow.ql-toolbar button:focus .ql-fill {
        fill: dt('editor.toolbar.item.hover.color');
    }

    .p-editor .ql-snow.ql-toolbar button.ql-active,
    .p-editor .ql-snow.ql-toolbar .ql-picker-label.ql-active,
    .p-editor .ql-snow.ql-toolbar .ql-picker-item.ql-selected {
        color: dt('editor.toolbar.item.active.color');
    }

    .p-editor .ql-snow.ql-toolbar button.ql-active .ql-stroke,
    .p-editor .ql-snow.ql-toolbar .ql-picker-label.ql-active .ql-stroke,
    .p-editor .ql-snow.ql-toolbar .ql-picker-item.ql-selected .ql-stroke {
        stroke: dt('editor.toolbar.item.active.color');
    }

    .p-editor .ql-snow.ql-toolbar button.ql-active .ql-fill,
    .p-editor .ql-snow.ql-toolbar .ql-picker-label.ql-active .ql-fill,
    .p-editor .ql-snow.ql-toolbar .ql-picker-item.ql-selected .ql-fill {
        fill: dt('editor.toolbar.item.active.color');
    }

    .p-editor .ql-snow.ql-toolbar button.ql-active .ql-picker-label,
    .p-editor .ql-snow.ql-toolbar .ql-picker-label.ql-active .ql-picker-label,
    .p-editor .ql-snow.ql-toolbar .ql-picker-item.ql-selected .ql-picker-label {
        color: dt('editor.toolbar.item.active.color');
    }
`,Se={root:function(t){var i=t.instance;return["p-editor",{"p-invalid":i.$invalid}]},toolbar:"p-editor-toolbar",content:"p-editor-content"},ze=te.extend({name:"editor",style:Ve,classes:Se}),je={name:"BaseEditor",extends:re,props:{placeholder:String,readonly:Boolean,formats:Array,editorStyle:null,modules:null},style:ze,provide:function(){return{$pcEditor:this,$parentInstance:this}}};function z(n){"@babel/helpers - typeof";return z=typeof Symbol=="function"&&typeof Symbol.iterator=="symbol"?function(t){return typeof t}:function(t){return t&&typeof Symbol=="function"&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},z(n)}function J(n,t){var i=Object.keys(n);if(Object.getOwnPropertySymbols){var s=Object.getOwnPropertySymbols(n);t&&(s=s.filter(function(u){return Object.getOwnPropertyDescriptor(n,u).enumerable})),i.push.apply(i,s)}return i}function Pe(n){for(var t=1;t<arguments.length;t++){var i=arguments[t]!=null?arguments[t]:{};t%2?J(Object(i),!0).forEach(function(s){$e(n,s,i[s])}):Object.getOwnPropertyDescriptors?Object.defineProperties(n,Object.getOwnPropertyDescriptors(i)):J(Object(i)).forEach(function(s){Object.defineProperty(n,s,Object.getOwnPropertyDescriptor(i,s))})}return n}function $e(n,t,i){return(t=Ce(t))in n?Object.defineProperty(n,t,{value:i,enumerable:!0,configurable:!0,writable:!0}):n[t]=i,n}function Ce(n){var t=Ue(n,"string");return z(t)=="symbol"?t:t+""}function Ue(n,t){if(z(n)!="object"||!n)return n;var i=n[Symbol.toPrimitive];if(i!==void 0){var s=i.call(n,t);if(z(s)!="object")return s;throw new TypeError("@@toPrimitive must return a primitive value.")}return(t==="string"?String:Number)(n)}var Y=function(){try{return window.Quill}catch{return null}}(),K={name:"Editor",extends:je,inheritAttrs:!1,emits:["text-change","selection-change","load"],quill:null,watch:{modelValue:function(t,i){t!==i&&this.quill&&!this.quill.hasFocus()&&this.renderValue(t)},d_value:function(t,i){t!==i&&this.quill&&!this.quill.hasFocus()&&this.renderValue(t)},readonly:function(){this.handleReadOnlyChange()}},mounted:function(){var t=this,i={modules:Pe({toolbar:this.$refs.toolbarElement},this.modules),readOnly:this.readonly,theme:"snow",formats:this.formats,placeholder:this.placeholder};Y?(this.quill=new Y(this.$refs.editorElement,i),this.initQuill(),this.handleLoad()):ie(()=>import("./quill-Cy_hvSCZ.js").then(s=>s.q),__vite__mapDeps([0,1])).then(function(s){s&&ae(t.$refs.editorElement)&&(s.default?t.quill=new s.default(t.$refs.editorElement,i):t.quill=new s(t.$refs.editorElement,i),t.initQuill())}).then(function(){t.handleLoad()})},beforeUnmount:function(){this.quill=null},methods:{renderValue:function(t){if(this.quill)if(t){var i=this.quill.clipboard.convert({html:t});this.quill.setContents(i)}else this.quill.setText("")},initQuill:function(){var t=this;this.renderValue(this.d_value),this.quill.on("text-change",function(i,s,u){if(u==="user"){var q=t.quill.getSemanticHTML(),v=t.quill.getText().trim();q==="<p><br></p>"&&(q=""),t.writeValue(q),t.$emit("text-change",{htmlValue:q,textValue:v,delta:i,source:u,instance:t.quill})}}),this.quill.on("selection-change",function(i,s,u){var q=t.quill.getSemanticHTML(),v=t.quill.getText().trim();t.$emit("selection-change",{htmlValue:q,textValue:v,range:i,oldRange:s,source:u,instance:t.quill})})},handleLoad:function(){this.quill&&this.quill.getModule("toolbar")&&this.$emit("load",{instance:this.quill})},handleReadOnlyChange:function(){this.quill&&this.quill.enable(!this.readonly)}}};function Ee(n,t,i,s,u,q){return p(),b("div",a({class:n.cx("root")},n.ptmi("root")),[l("div",a({ref:"toolbarElement",class:n.cx("toolbar")},n.ptm("toolbar")),[oe(n.$slots,"toolbar",{},function(){return[l("span",a({class:"ql-formats"},n.ptm("formats")),[l("select",a({class:"ql-header",defaultValue:"0"},n.ptm("header")),[l("option",a({value:"1"},n.ptm("option")),"Heading",16),l("option",a({value:"2"},n.ptm("option")),"Subheading",16),l("option",a({value:"0"},n.ptm("option")),"Normal",16)],16),l("select",a({class:"ql-font"},n.ptm("font")),[l("option",se(de(n.ptm("option"))),null,16),l("option",a({value:"serif"},n.ptm("option")),null,16),l("option",a({value:"monospace"},n.ptm("option")),null,16)],16)],16),l("span",a({class:"ql-formats"},n.ptm("formats")),[l("button",a({class:"ql-bold",type:"button"},n.ptm("bold")),null,16),l("button",a({class:"ql-italic",type:"button"},n.ptm("italic")),null,16),l("button",a({class:"ql-underline",type:"button"},n.ptm("underline")),null,16)],16),l("span",a({class:"ql-formats"},n.ptm("formats")),[l("select",a({class:"ql-color"},n.ptm("color")),null,16),l("select",a({class:"ql-background"},n.ptm("background")),null,16)],16),l("span",a({class:"ql-formats"},n.ptm("formats")),[l("button",a({class:"ql-list",value:"ordered",type:"button"},n.ptm("list")),null,16),l("button",a({class:"ql-list",value:"bullet",type:"button"},n.ptm("list")),null,16),l("select",a({class:"ql-align"},n.ptm("select")),[l("option",a({defaultValue:""},n.ptm("option")),null,16),l("option",a({value:"center"},n.ptm("option")),null,16),l("option",a({value:"right"},n.ptm("option")),null,16),l("option",a({value:"justify"},n.ptm("option")),null,16)],16)],16),l("span",a({class:"ql-formats"},n.ptm("formats")),[l("button",a({class:"ql-link",type:"button"},n.ptm("link")),null,16),l("button",a({class:"ql-image",type:"button"},n.ptm("image")),null,16),l("button",a({class:"ql-code-block",type:"button"},n.ptm("codeBlock")),null,16)],16),l("span",a({class:"ql-formats"},n.ptm("formats")),[l("button",a({class:"ql-clean",type:"button"},n.ptm("clean")),null,16)],16)]})],16),l("div",a({ref:"editorElement",class:n.cx("content"),style:n.editorStyle},n.ptm("content")),null,16)],16)}K.render=Ee;const Oe={class:"flex flex-col min-h-screen overflow-hidden card"},Ie={class:"p-6 border-b border-surface-200 dark:border-surface-700 flex justify-between items-center gap-4"},De={class:"flex flex-1 overflow-hidden"},Ae={class:"flex-1 p-6 flex flex-col gap-6 min-w-0 overflow-auto"},Te={class:"flex flex-col gap-2"},Re={class:"relative h-[19rem] rounded-2xl border border-surface-200 dark:border-surface-700 overflow-hidden"},Le=["src"],He={class:"absolute top-[18px] right-[18px]"},_e={class:"flex flex-col gap-2"},Be={class:"flex-1 flex flex-col gap-2 min-w-0"},Ne={class:"hidden xl:block w-[309px] p-6 bg-surface-0 dark:bg-surface-900 border-l border-surface-200 dark:border-surface-700"},Me={class:"flex flex-col gap-6"},Fe={class:"flex gap-4"},Qe={class:"flex justify-start items-center gap-2 w-full"},We={class:"flex-1 text-primary-600 dark:text-primary-400 text-base font-medium"},Ge={class:"flex justify-start items-center gap-2 w-full"},Je={class:"flex-1 text-primary-600 dark:text-primary-400 text-base font-medium"},Ye={class:"flex flex-col gap-3"},Ke={class:"flex items-center gap-2"},Xe={class:"flex items-center gap-2"},Ze={class:"flex items-center gap-2"},el={class:"flex justify-start items-center gap-2 w-full"},ll={class:"flex-1 text-primary-600 dark:text-primary-400 text-base font-medium"},nl={class:"flex flex-col gap-2"},tl={key:0,class:"flex gap-1 overflow-hidden min-h-[2rem]"},ol={key:1,class:"text-surface-500 min-h-[2rem] flex items-center"},rl={class:"flex flex-col gap-4"},il={class:"flex flex-col gap-3"},al=["for"],sl={class:"flex flex-col gap-2"},dl={class:"flex flex-col gap-6 p-4 px-2"},ql={class:"flex gap-4"},cl={class:"flex justify-start items-center gap-2 w-full"},pl={class:"flex-1 text-primary-600 dark:text-primary-400 text-base font-medium"},ul={class:"flex justify-start items-center gap-2 w-full"},bl={class:"flex-1 text-primary-600 dark:text-primary-400 text-base font-medium"},fl={class:"flex flex-col gap-3"},ml={class:"flex items-center gap-2"},vl={class:"flex items-center gap-2"},kl={class:"flex items-center gap-2"},wl={class:"flex justify-start items-center gap-2 w-full"},xl={class:"flex-1 text-primary-600 dark:text-primary-400 text-base font-medium"},gl={class:"flex flex-col gap-2"},hl={key:0,class:"flex gap-1 overflow-hidden min-h-[2rem]"},yl={key:1,class:"text-surface-500 min-h-[2rem] flex items-center"},Vl={class:"flex flex-col gap-4"},Sl={class:"flex flex-col gap-3"},zl=["for"],jl={class:"flex flex-col gap-2"},Rl={__name:"Edit",setup(n){const t=c(!1),i=c("The Smartest Ways to Earn Airline Miles"),s=c("Your credit score plays a crucial role in your financial well-being, influencing your ability to secure loans, mortgages, and even rental agreements. A higher score can unlock better interest rates and financial flexibility. Understanding how to improve and maintain a strong credit score is essential for achieving financial stability. Here are five golden rules to help you boost your score effectively."),u=c("Draft"),q=c("Public"),v=c(new Date),x=c([{name:"Dianne Russell",image:"/demo/images/cms/avatars/avatar-dianne.jpg"}]),j=c(["Lifestyle","Art","Banking"]),P=c(["World","Space"]),D=c(["World","Space","Technology","Science","Nature","Travel","Art","Music","Food","Sports"]),$=c(["status","visibility","publish-date"]),A=c([{label:"Draft",value:"Draft"},{label:"Published",value:"Published"},{label:"Scheduled",value:"Scheduled"}]),T=c([{name:"Dianne Russell",image:"/demo/images/cms/avatars/avatar-dianne.jpg"},{name:"Jane Smith",image:"/demo/images/cms/avatars/avatar-jane.jpg"},{name:"Darrell Steward",image:"/demo/images/cms/avatars/avatar-darrell.jpg"},{name:"Emma Wilson",image:"/demo/images/cms/avatars/avatar-emma.jpg"},{name:"Ethan Hunt",image:"/demo/images/cms/avatars/avatar-ethan.jpg"},{name:"Sophia Chen",image:"/demo/images/cms/avatars/avatar-sophia.jpg"}]),R=c(["Lifestyle","Sustainability","Culture","Art","Banking","Technology"]),C=c("/demo/images/cms/cms-hero-1.jpg"),L=c(null),H=fe(()=>{if(!v.value)return"Immediately";const k=new Date(v.value),e={month:"short",day:"numeric",year:"numeric"};return k.toLocaleDateString("en-US",e)});function X(){C.value=null}function Z(){var k;(k=L.value)==null||k.click()}function ee(k){const e=k.target.files[0];if(e&&e.type.startsWith("image/")){const f=new FileReader;f.onload=O=>{C.value=O.target.result},f.readAsDataURL(e)}}function _(k,e){k.stopPropagation(),x.value=x.value.filter(f=>f.name!==e.name)}return(k,e)=>{const f=qe,O=ce,le=K,g=ge,B=ue,h=he,y=xe,V=be,N=ye,M=we,F=ke,U=ve,Q=me,ne=pe;return p(),b("div",Oe,[l("div",Ie,[e[22]||(e[22]=l("h1",{class:"flex-1 text-surface-900 dark:text-surface-0 text-lg font-medium"},"Create a new post",-1)),r(f,{icon:"pi pi-bars",severity:"secondary",onClick:e[0]||(e[0]=o=>t.value=!0),class:"flex! xl:hidden!"})]),l("div",De,[l("div",Ae,[l("div",Te,[e[25]||(e[25]=l("label",{class:"text-surface-900 dark:text-surface-0 text-base font-medium"},"Cover",-1)),l("div",Re,[C.value?(p(),b(S,{key:0},[l("img",{src:C.value,alt:"Cover image",class:"w-full h-full object-cover"},null,8,Le),e[23]||(e[23]=l("div",{class:"absolute inset-0 bg-linear-to-b from-transparent to-black/30"},null,-1)),l("div",He,[r(f,{icon:"pi pi-trash",severity:"secondary",size:"small",class:"text-red-500! dark:text-red-400!",onClick:X})])],64)):(p(),b("div",{key:1,class:"w-full h-full bg-surface-100 dark:bg-surface-800 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors",onClick:Z},[...e[24]||(e[24]=[W('<div class="w-12 h-12 rounded-full bg-surface-200 dark:bg-surface-600 flex items-center justify-center"><i class="pi pi-cloud-upload text-surface-600 dark:text-surface-300 text-xl"></i></div><div class="text-center"><div class="text-surface-900 dark:text-surface-0 text-base font-medium mb-1">Click to upload cover image</div><div class="text-surface-500 dark:text-surface-400 text-sm">PNG, JPG or WebP (max 5MB)</div></div>',2)])])),l("input",{ref_key:"fileInput",ref:L,type:"file",accept:"image/*",onChange:ee,class:"hidden"},null,544)])]),l("div",_e,[e[26]||(e[26]=l("label",{class:"text-surface-900 dark:text-surface-0 text-base font-medium"},"Title",-1)),r(O,{modelValue:i.value,"onUpdate:modelValue":e[1]||(e[1]=o=>i.value=o),placeholder:"The Smartest Ways to Earn Airline Miles"},null,8,["modelValue"])]),l("div",Be,[e[27]||(e[27]=l("label",{class:"text-surface-900 dark:text-surface-0 text-base font-medium"},"Content",-1)),r(le,{modelValue:s.value,"onUpdate:modelValue":e[2]||(e[2]=o=>s.value=o),editorStyle:"min-height: 320px; padding-top:0; overflow-wrap: break-word; word-break: break-word;",class:"min-w-0!"},null,8,["modelValue"])])]),l("div",Ne,[l("div",Me,[l("div",Fe,[r(f,{label:"Save Draft",outlined:"",severity:"secondary",class:"flex-1"}),r(f,{label:"Publish",severity:"primary",class:"flex-1"})]),e[39]||(e[39]=W('<div class="w-full border-t border-dashed border-surface-200 dark:border-surface-700"></div><div class="flex flex-col gap-4"><div class="flex justify-start items-start gap-2"><span class="flex-1 text-surface-900 dark:text-surface-0 text-base font-medium">Publish</span><a href="#" class="text-primary-600 dark:text-primary-400 text-base font-medium underline">Preview</a></div></div>',2)),r(M,{multiple:!0,value:$.value,"onUpdate:value":e[8]||(e[8]=o=>$.value=o),pt:{root:{class:"border-0! shadow-none!"}},expandIcon:"pi pi-chevron-down text-primary!",collapseIcon:"pi pi-chevron-up text-primary!"},{default:d(()=>[r(y,{value:"status",pt:{root:{class:"border-0! "}}},{default:d(()=>[r(g,{pt:{root:{class:"bg-transparent! border-0! p-0! py-4! shadow-none!"},content:{class:"justify-start items-center w-full px-0"}}},{default:d(()=>[l("div",Qe,[e[28]||(e[28]=l("span",{class:"text-surface-900 dark:text-surface-0 text-base font-medium"},"Status:",-1)),l("span",We,w(u.value),1)])]),_:1}),r(h,{pt:{content:{class:"bg-transparent! border-0! p-0! pb-4!"}}},{default:d(()=>[r(B,{modelValue:u.value,"onUpdate:modelValue":e[3]||(e[3]=o=>u.value=o),options:A.value,optionLabel:"label",optionValue:"value",class:"w-full!"},null,8,["modelValue","options"])]),_:1})]),_:1}),e[34]||(e[34]=l("div",{class:"w-full border-t border-dashed border-surface-200 dark:border-surface-700"},null,-1)),r(y,{value:"visibility",pt:{root:{class:"border-0! "}}},{default:d(()=>[r(g,{pt:{root:{class:"bg-transparent! border-0! p-0! py-4! shadow-none!"},content:{class:"justify-start items-center w-full px-0"}}},{default:d(()=>[l("div",Ge,[e[29]||(e[29]=l("span",{class:"text-surface-900 dark:text-surface-0 text-base font-medium"},"Visibility:",-1)),l("span",Je,w(q.value),1)])]),_:1}),r(h,{pt:{content:{class:"bg-transparent! border-0! p-0! pb-4!"}}},{default:d(()=>[l("div",Ye,[l("div",Ke,[r(V,{modelValue:q.value,"onUpdate:modelValue":e[4]||(e[4]=o=>q.value=o),inputId:"public",value:"Public"},null,8,["modelValue"]),e[30]||(e[30]=l("label",{for:"public",class:"text-surface-900 dark:text-surface-0 text-base"},"Public",-1))]),l("div",Xe,[r(V,{modelValue:q.value,"onUpdate:modelValue":e[5]||(e[5]=o=>q.value=o),inputId:"password",value:"Password protected"},null,8,["modelValue"]),e[31]||(e[31]=l("label",{for:"password",class:"text-surface-900 dark:text-surface-0 text-base"},"Password protected",-1))]),l("div",Ze,[r(V,{modelValue:q.value,"onUpdate:modelValue":e[6]||(e[6]=o=>q.value=o),inputId:"private",value:"Private"},null,8,["modelValue"]),e[32]||(e[32]=l("label",{for:"private",class:"text-surface-900 dark:text-surface-0 text-base"},"Private",-1))])])]),_:1})]),_:1}),e[35]||(e[35]=l("div",{class:"w-full border-t border-dashed border-surface-200 dark:border-surface-700"},null,-1)),r(y,{value:"publish-date",pt:{root:{class:"border-0! "}}},{default:d(()=>[r(g,{pt:{root:{class:"bg-transparent! border-0! p-0! py-4! shadow-none!"},content:{class:"justify-start items-center w-full px-0"}}},{default:d(()=>[l("div",el,[e[33]||(e[33]=l("span",{class:"text-surface-900 dark:text-surface-0 text-base font-medium"},"Publish:",-1)),l("span",ll,w(H.value),1)])]),_:1}),r(h,{pt:{content:{class:"bg-transparent! border-0! p-0! pb-4!"}}},{default:d(()=>[r(N,{modelValue:v.value,"onUpdate:modelValue":e[7]||(e[7]=o=>v.value=o),showIcon:"",class:"w-full!"},null,8,["modelValue"])]),_:1})]),_:1})]),_:1},8,["value"]),e[40]||(e[40]=l("div",{class:"w-full border-t border-dashed border-surface-200 dark:border-surface-700"},null,-1)),l("div",nl,[e[36]||(e[36]=l("label",{class:"text-surface-900 dark:text-surface-0 text-base font-medium"},"Author",-1)),r(U,{modelValue:x.value,"onUpdate:modelValue":e[9]||(e[9]=o=>x.value=o),options:T.value,optionLabel:"name",placeholder:"Select authors"},{value:d(o=>[o.value&&o.value.length>0?(p(),b("div",tl,[(p(!0),b(S,null,E(o.value,m=>(p(),G(F,{key:m.name,label:m.name,image:m.image,removable:"",class:"shrink-0!",onRemove:I=>_(I,m)},null,8,["label","image","onRemove"]))),128))])):(p(),b("span",ol,"Select authors"))]),_:1},8,["modelValue","options"])]),e[41]||(e[41]=l("div",{class:"w-full border-t border-dashed border-surface-200 dark:border-surface-700"},null,-1)),l("div",rl,[e[37]||(e[37]=l("label",{class:"text-surface-900 dark:text-surface-0 text-base font-medium"},"Category",-1)),l("div",il,[(p(!0),b(S,null,E(R.value,o=>(p(),b("div",{key:o,class:"flex items-center gap-2"},[r(Q,{modelValue:j.value,"onUpdate:modelValue":e[10]||(e[10]=m=>j.value=m),inputId:o,value:o},null,8,["modelValue","inputId","value"]),l("label",{for:o,class:"text-surface-900 dark:text-surface-0 text-base"},w(o),9,al)]))),128))])]),e[42]||(e[42]=l("div",{class:"w-full border-t border-dashed border-surface-200 dark:border-surface-700"},null,-1)),l("div",sl,[e[38]||(e[38]=l("label",{class:"text-surface-900 dark:text-surface-0 text-base font-medium"},"Tag",-1)),r(U,{modelValue:P.value,"onUpdate:modelValue":e[11]||(e[11]=o=>P.value=o),options:D.value,placeholder:"Select tags",display:"chip",class:"w-full!"},null,8,["modelValue","options"])]),e[43]||(e[43]=l("div",{class:"w-full border-t border-dashed border-surface-200 dark:border-surface-700"},null,-1)),r(f,{label:"Move to trash",icon:"pi pi-trash",severity:"danger",outlined:""})])])]),r(ne,{visible:t.value,"onUpdate:visible":e[21]||(e[21]=o=>t.value=o),position:"right",class:"w-full! max-w-md!"},{header:d(()=>[...e[44]||(e[44]=[l("h3",{class:"text-surface-900 dark:text-surface-0 text-lg font-medium"},"Publishing Settings",-1)])]),default:d(()=>[l("div",dl,[l("div",ql,[r(f,{label:"Save Draft",outlined:"",severity:"secondary",class:"flex-1"}),r(f,{label:"Publish",severity:"primary",class:"flex-1"})]),e[56]||(e[56]=l("div",{class:"w-full border-t border-dashed border-surface-200 dark:border-surface-700"},null,-1)),e[57]||(e[57]=l("div",{class:"flex flex-col gap-4"},[l("div",{class:"flex justify-start items-start gap-2"},[l("span",{class:"flex-1 text-surface-900 dark:text-surface-0 text-base font-medium"},"Publish"),l("a",{href:"#",class:"text-primary-600 dark:text-primary-400 text-base font-medium underline"},"Preview")])],-1)),r(M,{multiple:!0,value:$.value,"onUpdate:value":e[17]||(e[17]=o=>$.value=o),pt:{root:{class:"border-0! shadow-none!"}},expandIcon:"pi pi-chevron-down text-primary!",collapseIcon:"pi pi-chevron-up text-primary!"},{default:d(()=>[r(y,{value:"status",pt:{root:{class:"border-0! "}}},{default:d(()=>[r(g,{pt:{root:{class:"bg-transparent! border-0! p-0! py-4! shadow-none!"},content:{class:"justify-start items-center w-full px-0"}}},{default:d(()=>[l("div",cl,[e[45]||(e[45]=l("span",{class:"text-surface-900 dark:text-surface-0 text-base font-medium"},"Status:",-1)),l("span",pl,w(u.value),1)])]),_:1}),r(h,{pt:{content:{class:"bg-transparent! border-0! p-0! pb-4!"}}},{default:d(()=>[r(B,{modelValue:u.value,"onUpdate:modelValue":e[12]||(e[12]=o=>u.value=o),options:A.value,optionLabel:"label",optionValue:"value",class:"w-full!"},null,8,["modelValue","options"])]),_:1})]),_:1}),e[51]||(e[51]=l("div",{class:"w-full border-t border-dashed border-surface-200 dark:border-surface-700"},null,-1)),r(y,{value:"visibility",pt:{root:{class:"border-0! "}}},{default:d(()=>[r(g,{pt:{root:{class:"bg-transparent! border-0! p-0! py-4! shadow-none!"},content:{class:"justify-start items-center w-full px-0"}}},{default:d(()=>[l("div",ul,[e[46]||(e[46]=l("span",{class:"text-surface-900 dark:text-surface-0 text-base font-medium"},"Visibility:",-1)),l("span",bl,w(q.value),1)])]),_:1}),r(h,{pt:{content:{class:"bg-transparent! border-0! p-0! pb-4!"}}},{default:d(()=>[l("div",fl,[l("div",ml,[r(V,{modelValue:q.value,"onUpdate:modelValue":e[13]||(e[13]=o=>q.value=o),inputId:"mobile-public",value:"Public"},null,8,["modelValue"]),e[47]||(e[47]=l("label",{for:"mobile-public",class:"text-surface-900 dark:text-surface-0 text-base"},"Public",-1))]),l("div",vl,[r(V,{modelValue:q.value,"onUpdate:modelValue":e[14]||(e[14]=o=>q.value=o),inputId:"mobile-password",value:"Password protected"},null,8,["modelValue"]),e[48]||(e[48]=l("label",{for:"mobile-password",class:"text-surface-900 dark:text-surface-0 text-base"},"Password protected",-1))]),l("div",kl,[r(V,{modelValue:q.value,"onUpdate:modelValue":e[15]||(e[15]=o=>q.value=o),inputId:"mobile-private",value:"Private"},null,8,["modelValue"]),e[49]||(e[49]=l("label",{for:"mobile-private",class:"text-surface-900 dark:text-surface-0 text-base"},"Private",-1))])])]),_:1})]),_:1}),e[52]||(e[52]=l("div",{class:"w-full border-t border-dashed border-surface-200 dark:border-surface-700"},null,-1)),r(y,{value:"publish-date",pt:{root:{class:"border-0! "}}},{default:d(()=>[r(g,{pt:{root:{class:"bg-transparent! border-0! p-0! py-4! shadow-none!"},content:{class:"justify-start items-center w-full px-0"}}},{default:d(()=>[l("div",wl,[e[50]||(e[50]=l("span",{class:"text-surface-900 dark:text-surface-0 text-base font-medium"},"Publish:",-1)),l("span",xl,w(H.value),1)])]),_:1}),r(h,{pt:{content:{class:"bg-transparent! border-0! p-0! pb-4!"}}},{default:d(()=>[r(N,{modelValue:v.value,"onUpdate:modelValue":e[16]||(e[16]=o=>v.value=o),showIcon:"",class:"w-full!"},null,8,["modelValue"])]),_:1})]),_:1})]),_:1},8,["value"]),e[58]||(e[58]=l("div",{class:"w-full border-t border-dashed border-surface-200 dark:border-surface-700"},null,-1)),l("div",gl,[e[53]||(e[53]=l("label",{class:"text-surface-900 dark:text-surface-0 text-base font-medium"},"Author",-1)),r(U,{modelValue:x.value,"onUpdate:modelValue":e[18]||(e[18]=o=>x.value=o),options:T.value,optionLabel:"name",placeholder:"Select authors"},{value:d(o=>[o.value&&o.value.length>0?(p(),b("div",hl,[(p(!0),b(S,null,E(o.value,m=>(p(),G(F,{key:m.name,label:m.name,image:m.image,removable:"",class:"shrink-0!",onRemove:I=>_(I,m)},null,8,["label","image","onRemove"]))),128))])):(p(),b("span",yl,"Select authors"))]),_:1},8,["modelValue","options"])]),e[59]||(e[59]=l("div",{class:"w-full border-t border-dashed border-surface-200 dark:border-surface-700"},null,-1)),l("div",Vl,[e[54]||(e[54]=l("label",{class:"text-surface-900 dark:text-surface-0 text-base font-medium"},"Category",-1)),l("div",Sl,[(p(!0),b(S,null,E(R.value,o=>(p(),b("div",{key:o,class:"flex items-center gap-2"},[r(Q,{modelValue:j.value,"onUpdate:modelValue":e[19]||(e[19]=m=>j.value=m),inputId:"mobile-"+o,value:o},null,8,["modelValue","inputId","value"]),l("label",{for:"mobile-"+o,class:"text-surface-900 dark:text-surface-0 text-base"},w(o),9,zl)]))),128))])]),e[60]||(e[60]=l("div",{class:"w-full border-t border-dashed border-surface-200 dark:border-surface-700"},null,-1)),l("div",jl,[e[55]||(e[55]=l("label",{class:"text-surface-900 dark:text-surface-0 text-base font-medium"},"Tag",-1)),r(U,{modelValue:P.value,"onUpdate:modelValue":e[20]||(e[20]=o=>P.value=o),options:D.value,placeholder:"Select tags",display:"chip",class:"w-full!"},null,8,["modelValue","options"])]),e[61]||(e[61]=l("div",{class:"w-full border-t border-dashed border-surface-200 dark:border-surface-700"},null,-1)),r(f,{label:"Move to trash",icon:"pi pi-trash",severity:"danger",outlined:""})])]),_:1},8,["visible"])])}}};export{Rl as default};
