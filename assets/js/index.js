/**
1. Render song
2. Scroll top
3. Play / Pause / Seek
4. CD roate
5. Next / prev
6. Random
7. Next / Repeat when ended
8. Active song
9. Scroll active song into view
10. Play song when click
 */

const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

const appPlay = $('.music-app')
const cd = $('.cd')
const heading = $('.header h3')
const cdThumb = $('.cd-thumb')
const audio = $('#audio')
const playBtn = $('.btn-toggle-play')
const progress = $('#progress')
const nextBtn = $('.btn-next')
const prevBtn = $('.btn-prev')
const randomBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')
const timeStart = $('.time-start')
const timeEnd = $('.time-end')
const playlist = $('.playlist')

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    songs: [{
            name: 'Yêu đương khó quá thì chạy về khóc với anh',
            singer: 'Erik',
            path: './assets/music/song1.mp3',
            image: './assets/images/song1.jpg'
        },
        {
            name: 'Chạy về nơi phía anh',
            singer: 'Khắc Việt',
            path: './assets/music/song2.mp3',
            image: './assets/images/song2.jpg'
        },
        {
            name: 'Ngày đầu tiên ',
            singer: 'Đức Phúc',
            path: './assets/music/song3.mp3',
            image: './assets/images/song3.jpg'
        },
        {
            name: 'Ái Nộ',
            singer: 'Masew & Khoi Vu',
            path: './assets/music/song4.mp3',
            image: './assets/images/song4.jpg'
        },
        {
            name: 'Đế Vương',
            singer: 'Đình Dũng',
            path: './assets/music/song5.mp3',
            image: './assets/images/song5.jpg'
        },
        {
            name: 'Tấm lòng son',
            singer: 'H-Kray',
            path: './assets/music/song6.mp3',
            image: './assets/images/song6.jpg'
        },
        {
            name: 'Duyên Âm',
            singer: 'Hoàng Thùy Linh',
            path: './assets/music/song7.mp3',
            image: './assets/images/song7.jpg'
        },
    ],
    render: function () {
        const htmls = this.songs.map((song, index) => {
            return `
            <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index=${index}>
            <div class="thumb"
                style="background-image: url('${song.image}')">
            </div>
            <div class="body">
                <h3 class="title">${song.name}</h3>
                <p class="author">${song.singer}</p>
            </div>
            <div class="option">
                <i class="fas fa-ellipsis-h"></i>
            </div>
        </div>
            `
        })

        playlist.innerHTML = htmls.join('')
    },
    defineProperties: function () {
        Object.defineProperty(this, 'currentSong', {
            get: function () {
                return this.songs[this.currentIndex]
            }
        })
    },
    handleEvents: function () {
        const _this = this
        // scroll dashbard
        const cdWidth = cd.offsetWidth
        document.onscroll = function () {
            const scrollTop = document.documentElement.scrollTop
            const newCdWidth = cdWidth - scrollTop

            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0
            cd.style.opacity = newCdWidth / cdWidth
        }

        // CD rotate when playing
        const cdAnimate = cdThumb.animate([{
            transform: 'rotate(360deg)'
        }], {
            duration: 10000,
            iterations: Infinity
        })
        cdAnimate.pause()

        // click play song
        playBtn.onclick = function () {
            if (_this.isPlaying) {
                audio.pause()
            } else {
                audio.play()
            }

        }

        // thuc thi play
        audio.onplay = function () {
            _this.isPlaying = true
            appPlay.classList.add('playing')
            cdAnimate.play()
            cd.classList.add('active')
        }
        // thuc thi pause
        audio.onpause = function () {
            _this.isPlaying = false
            appPlay.classList.remove('playing')
            cdAnimate.pause()
            cd.classList.remove('active')
        }

        // progress change when play song
        audio.ontimeupdate = function () {
            if (audio.duration) {
                const progressPercent = Math.floor(audio.currentTime / audio.duration * 100)
                progress.value = progressPercent
            }
            // Update song current time
            const currentMin = Math.floor(audio.currentTime / 60)
            const currentSec = Math.floor(audio.currentTime % 60)
            timeStart.textContent = `${currentMin}:${currentSec}`
        }

        // update song total  duration
        audio.onloadeddata = function () {
            const totalMin = Math.floor(audio.duration / 60)
            const totalSec = Math.floor(audio.duration % 60)
            timeEnd.textContent = `${totalMin}:${totalSec}`
        }

        // update currentTime when change progress
        progress.oninput = function (e) {
            const seek = audio.duration / 100 * e.target.value
            audio.currentTime = seek
            audio.play()
        }

        // click next song
        nextBtn.onclick = function () {
            if (_this.isRandom) {
                _this.randomSong()
            } else {
                _this.nextSong()
            }
            audio.play()
            _this.render()
            _this.songScrollToView()
        }

        // Click prev song
        prevBtn.onclick = function () {
            if (_this.isRandom) {
                _this.randomSong()
            } else {
                _this.prevSong()
            }
            audio.play()
            _this.render()
            _this.songScrollToView()
        }

        // Random song
        randomBtn.onclick = function () {
            _this.isRandom = !_this.isRandom
            randomBtn.classList.toggle('active', _this.isRandom)
        }

        // Repeat song
        repeatBtn.onclick = function () {
            _this.isRepeat = !_this.isRepeat
            repeatBtn.classList.toggle('active', _this.isRepeat)
        }

        // Click playlist play song
        playlist.onclick = function (e) {
            const songNote = e.target.closest(".song:not(.active)")
            if (songNote) {
                _this.currentIndex = Number(songNote.getAttribute('data-index'))
                _this.loadCurrentSong()
                _this.render()
                audio.play()
            }
            _this.songScrollToView()
        }

        // when song ended
        audio.onended = function () {
            if (_this.isRepeat) {
                audio.play()
            } else {
                nextBtn.click()
            }
        }
    },
    nextSong: function () {
        this.currentIndex++
        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0
        }
        this.loadCurrentSong()
    },
    prevSong: function () {
        this.currentIndex--
        if (this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1
        }
        this.loadCurrentSong()
    },
    randomSong: function () {
        let newIndex
        do {
            newIndex = Math.floor(Math.random() * this.songs.length)
        } while (newIndex === this.currentIndex)
        this.currentIndex = newIndex
        this.loadCurrentSong()
    },
    songScrollToView: function () {
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior: "smooth",
                block: "center"
            })
        }, 300)
    },
    loadCurrentSong: function () {
        heading.textContent = this.currentSong.name
        cdThumb.style.backgroundImage = `url(${this.currentSong.image})`
        audio.src = this.currentSong.path
    },
    start: function () {
        this.defineProperties()
        this.handleEvents()
        this.loadCurrentSong()
        this.render()
    }
}

app.start()