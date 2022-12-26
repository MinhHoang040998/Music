const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = 'MinhHoang'

const player = $('.player');
const cd = $('.cd');
const heading = $('header h2');
const cdThumb = $('.cd-thumb');
const audio = $('#audio');
const playBtn = $('.btn-toggle-play'); 
const progress = $('#progress');
const nextBtn = $('.btn-next');
const prevBtn = $('.btn-prev');
const randomBtn = $('.btn-random');
const repeatBTn = $('.btn-repeat'); 
const playlist = $('.playlist');

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs : [
        {
            name: 'Anh Tự Do Nhưng Cô Đơn',
            singer: 'Trung Quân',
            path:'song1.mp3',
            image:'song1.jpg'
        },
        {
            name: 'Chưa Quên Người Yêu Cũ',
            singer: 'Trung Quân ft Hà Nhi',
            path:'song2.mp3',
            image:'song2.jpg'
        },
        {
            name: 'Chuyện Đôi Ta',
            singer: 'Emcee L',
            path:'song3.mp3',
            image:'song3.jpg'
        },
        {
            name: 'Một Ngàn Nỗi Đau',
            singer: 'Trung Quân',
            path:'song4.mp3',
            image:'song4.jpg'
        },
        {
            name: 'Nắm Đôi Bàn Tay',
            singer: 'Kay Trần',
            path:'song5.mp3',
            image:'song5.jpg'
        },
        {
            name: 'Ngủ Một Mình',
            singer: 'HIEUTHUHAI',
            path:'song6.mp3',
            image:'song6.jpg'
        },
        {
            name: 'RedRum',
            singer: 'Táo',
            path:'song7.mp3',
            image:'song7.jpg'
        },
        {
            name: 'See Tình',
            singer: 'Hoàng Thuỳ Linh',
            path:'song8.mp3',
            image:'song8.jpg'
        },
        {
            name: 'Vài Câu Nói Có Khiến Người Thay Đổi',
            singer: 'GrayD ft Tlinh',
            path:'song9.mp3',
            image:'song9.jpg'
        },
        {
            name: 'Waiting For You',
            singer: 'Mono',
            path:'song10.mp3',
            image:'song10.jpg'
        }
    ]
    ,
    setConfig: function(key, value){
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))
    },
    render: function(){
        const htmls = this.songs.map((song , index) => {
            return`            
            <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
                <div class="thumb" style="background-image: url('${song.image}')">
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
    defineProperties: function(){
        Object.defineProperty(this, 'currentSong', {
            get: function(){
                return this.songs[this.currentIndex];
            }
        })
        
    },

    handleEvent: function(){
        const _this = this;
        const cdWidth = cd.offsetWidth;

        // Xử lý CD quay / dừng 
        const cdThumbAnimate = cdThumb.animate([
            { transform: 'rotate(360deg)'}
        ], {
            duration: 10000, // 10 seconds
            interations : Infinity
        })
        cdThumbAnimate.pause();


        // Xử Lý phóng to/ Thu nhỏ cd
        document.onscroll = function(){
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const newCdWidth = cdWidth - scrollTop;

            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px': 0;
            cd.style.opacity = newCdWidth / cdWidth;
        }
        // Xử lý khi click play
        playBtn.onclick = function (){
            if(_this.isPlaying){

                audio.pause()

            }   else {

                audio.play()
            }
        }


        //  Khi song được play 
        audio.onplay = function(){
            _this.isPlaying = true; 
            player.classList.add('playing');
            cdThumbAnimate.play();
        }

        // Khi song bị pause
        audio.onpause = function(){
            _this.isPlaying = false; 
            player.classList.remove('playing');
            cdThumbAnimate.pause();
        }
        
        // Khi tiến độ bài hát thay đổi
        audio.ontimeupdate = function(){
            if(audio.duration){
                const progressPercent = Math.floor(audio.currentTime / audio.duration * 100)
                progress.value = progressPercent
            }
        }

        // Xử lý khi tua song 
        progress.onchange = function(e){
            const seekTime = audio.duration / 100 * e.target.value
            audio.currentTime = seekTime
        }

        // Khi next song 
        nextBtn.onclick = function(){
            if(_this.isRandom){
                _this.playRandomSong()
            }else{
                _this.nextSong() 
            }
            audio.play()
            _this.render()
            _this.scrollToActiveSong()
        }

        // Khi prev song 
        prevBtn.onclick = function(){
            if(_this.isRandom){
              _this.playRandomSong()  
            }else{
            _this.prevSong() 
            }
            audio.play()
            _this.render()
            _this.scrollToActiveSong()
        }


        // Xử lý random bật / tắt random song
        randomBtn.onclick = function(e){
            _this.isRandom = !_this.isRandom;
            _this.setConfig('isRandom', _this.isRandom)
            randomBtn.classList.toggle('active', _this.isRandom)
        }


        // Xử lý phát lại 1 bài hát 
        repeatBTn.onclick = function(e){
            _this.isRepeat = !_this.isRepeat
            _this.setConfig('isRepeat', _this.isRepeat)
            repeatBTn.classList.toggle('active', _this.isRepeat) 
        }

        // Xử lý next song khi audio ended
        audio.onended = function (){
            if (_this.isRepeat){
                audio.play()
            } else {
                nextBtn.click();
            }
        }

        // Lắng nghe hành vi click vào playlist
        playlist.onclick = function (e){
            const songNode = e.target.closet('.song:not(.active');
            if (songNode || e.target.closet('.option')){
                     // Xử lý khi click vào song
                if (songNode){
                    _this.currentIndex = Number(songNode.dataset.index)
                    _this.loadCurrentSong()
                    _this.render()
                    audio.play()
                }
                    // Xử lý khi click vào option
                if ( e.target.closet('.option')){

                }

            }
        }
    },

    scrollToActiveSong: function(){
        setTimeout(() =>{
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
            })
        }, 300)
    },

    loadCurrentSong: function(){
        

        heading.textContent = this.currentSong.name
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`
        audio.src = this.currentSong.path

        console.log(heading, cdThumb, audio)
    },
    loadConfig: function(){
        this.isRandom = this.config.isRandom 
        this.isRepeat = this.config.isRepeat
    },

    nextSong: function(){
        this.currentIndex++
        if (this.currentIndex >= this.songs.length){
            this.currentIndex = 0
        }
        this.loadCurrentSong()
    },
    prevSong: function(){
        this.currentIndex--
        if (this.currentIndex < 0){
            this.currentIndex = this.songs.length - 1
        }
        this.loadCurrentSong()
    },

    playRandomSong: function(){
        let newIndex 
        do{
            newIndex = Math.floor(Math.random() * this.songs.length)
        } while (newIndex === this.currentIndex)

        this.currentIndex = newIndex
        this.loadCurrentSong()
    },

    start: function(){
        // Gán cấu hình từ config vào ứng dụng
        this.loadConfig()
        // Định nghĩa các thuộc tính Object 
        this.defineProperties()

        // Lắng nghe / xử lý sự kiện DOM event
        this.handleEvent()

        // Tải thông tin bài hát đầu tiên vào UI khi chạy ứng dụng
        this.loadCurrentSong()

        // render playlist
        this.render()
        // Hiển Thị Trạng Thái Ban đầu của button repeat và random
        randomBtn.classList.toggle('active', this.isRandom)
        repeatBTn.classList.toggle('active', this.isRepeat) 
    }
}
app.start();