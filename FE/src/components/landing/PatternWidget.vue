<script setup>
defineProps({
    leftClass: {
        type: String,
        default: ''
    },
    rightClass: {
        type: String,
        default: ''
    }
});
</script>

<template>
    <div :class="leftClass" class="absolute -top-2 -left-7 rotate-[43deg]">
        <div class="pattern w-[52rem] h-[72rem] absolute top-0 left-0" />
        <div class="pattern w-[52rem] h-[72rem] absolute top-28 left-28" />
        <div class="pattern w-[71rem] h-[15rem] absolute top-56 left-60" />
    </div>
    <div :class="rightClass" class="absolute -top-2 -right-7 rotate-[-43deg] scale-x-[-1]">
        <div class="pattern w-[52rem] h-[72rem] absolute top-0 left-0" />
        <div class="pattern w-[52rem] h-[72rem] absolute top-28 left-28" />
        <div class="pattern w-[71rem] h-[15rem] absolute top-56 left-60" />
    </div>
</template>
