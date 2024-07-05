<p data-ke-size="size16">팀플 주간이 끝났습니다!</p>
<p data-ke-size="size16">팀원분들의 노력 덕분에 무리없이 프로젝트를 완료 할 수 있었습니다.</p>
<p data-ke-size="size16">&nbsp;</p>
<p data-ke-size="size16">아웃소싱 프로젝트(aka 외부 api 사용 프로젝트)에서 저희는 네이버 지도 api 를 활용하여<br />운동 모임 사이트를 기획했고, 5일이라는 짧은 시간동안 요구사항을 대부분 구현했습니다.</p>
<p data-ke-size="size16">오늘은 그 중 제가 담당했던 네이버 지도 api 에 관한 사항을 정리하려고 합니다.</p>
<h2 data-ke-size="size26">네이버지도 with React - Step by Step 1</h2>
<h3 data-ke-size="size23">네이버 지도 api script 동적 로드</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>네이버 지도 api 를 이용하기 위해서는 <code>https://openapi.map.naver.com/openapi/v3/maps.js</code> 라는 스크립트를 로드해야 합니다</li>
<li>index.html 에서 script 태그로 로드해도 되지만, 좀 더 동적인 방식을 고려하였습니다</li>
<li>사실 프로젝트에서 계속 지도를 사용하기 때문에 레이아웃 컴포넌트에 해당 로직이 포함되는 것이 더 좋았을 것 같습니다.</li>
<li>먼저 useQuery 로 user 를 가져오고, 역시 useQuery 로 모임 정보(contracts)를 가져오는 데 이 때 select 로 userid 와 일치하는 것만 가져옵니다</li>
<li>그런데 user 를 가져오는 부분에서 isPending 이면 user 의 값이 없을 것이기 때문에 사실 요렇게 짜면 안되지만, 로그인을 전제하는 프로젝트였어서 이미 초기에 query 값이 있을 것을 알고 있었기에 그냥 넘어갔습니다.</li>
<li>나머지는 useEffect 에서 script를 로드하는 로직입니다.</li>
</ul>
<pre class="javascript" data-ke-language="javascript"><code>function NavermapScriptComponent() {
    const { data: user, isPending } = useQuery({ 
        queryKey: ['user'], 
        queryFn:  () =&gt; authApi.getUser();
    });
    const { data: contracts, isPending: isContractsLoading } = useQuery({
        queryKey: ['contracts'],
        queryFn: () =&gt; contractsApi.getContracts(),
        select: (data) =&gt; data.filter((contract) =&gt; contract.user_id === user.id)
    });
    const [isScriptLoaded, setIsScriptLoaded] = useState(false);
<pre><code>useEffect(() =&amp;gt; {
    const script = document.createElement('script');
    script.src = `https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${
            import.meta.env.VITE_NCP_CLIENT_ID
        }&amp;amp;submodules=geocoder`;
    script.async = true;
    script.onload = () =&amp;gt; {
        if (window.naver) {
            setIsScriptLoaded(true);
        } else {
            console.error('네이버 맵 스크립트 로드 실패: window.naver가 정의되지 않음');
        }
    };
    script.onerror = () =&amp;gt; {
        console.error('네이버 맵 스크립트 로드 실패');
    };
    document.body.appendChild(script);

    return () =&amp;gt; {
        document.body.removeChild(script);
    };
}, []);

if (isLoading || !isScriptLoaded || isContractsLoading) {
    return &amp;lt;Loading /&amp;gt;;
}

return &amp;lt;Mainpage user={user} contracts={contracts} /&amp;gt;;
</code></pre>
<p>}</p>
<p>export default NavermapScriptComponent;</code></pre></p>
<h3 data-ke-size="size23">useMap CustomHook</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>매우 복잡해 보이지만 사실 그렇게 복잡하진 않습니다..?</li>
<li>여기서 주의할 것은 naver 객체에 접근 할 때, 앞에 window 를 붙여줘야 한다는 것입니다.</li>
<li>ts 였다면 어떻게 해야할지... 다음에 리팩토링 해봐야겠습니다.</li>
<li>이 컴스텀 훅은 그냥 레이어를 좀 분리하고 다른데서 사용하기 편하게 하는 정도의 역할을 합니다.</li>
<li>마지막에 실행되는 initGeocoder 를 위한 훅이라고 볼 수 있습니다.</li>
</ul>
<pre class="javascript" data-ke-language="javascript"><code>function useMap() {
    const [searchInput, setSearchInput] = useState(null);
    const [searchButton, setSearchButton] = useState(null);
    const [infoWindow, setInfoWindow] = useState(() =&gt;
        !window.naver ? null : new window.naver.maps.InfoWindow()
    );
    const [makeGatherButtonDom, setMakeGatherButtonDom] = useState(null);
<pre><code>const {
    selectedGeoData,
    setSelectedGeoData,
    userGps: gps,
    setUserGps: setGps
} = useMapStore(
    useShallow((state) =&amp;gt; ({
        selectedGeoData: state.selectedGeoData,
        setSelectedGeoData: state.setSelectedGeoData,
        userGps: state.userGps,
        setUserGps: state.setUserGps
    }))
);

const { data: user } = useQuery({ queryKey: ['user'], queryFn: loginUser });

const basicMarkerRef = useRef(null);
const mapRef = useRef(null);

const initializeMap = useCallback((gps) =&amp;gt; {
    const mapOptions = {
        center: new window.naver.maps.LatLng(...gps),
        zoom: INITIAL_ZOOM,
        scaleControl: false,
        logoControl: false,
        mapDataControl: false,
        zoomControl: false,
        mapTypeControl: false,
        minZoom: 8,
        tileTransition: true,
        tileDuration: 400,
        tileSpare: 5,
        zoomControlOptions: {
            position: window.naver.maps.Position.RIGHT_TOP, 
            style: window.naver.maps.ZoomControlStyle.SMALL
        }
    };

    const map = new window.naver.maps.Map('map01', mapOptions);
    mapRef.current = map;

    const marker = new window.naver.maps.Marker({
        position: new window.naver.maps.LatLng(...gps),
        map: map
    });
    basicMarkerRef.current = marker;
}, []);


// 초기에 사용자의 위치 정보를 가져옴
useLayoutEffect(() =&amp;gt; {
    if (gps) return;
    const success = ({ coords }) =&amp;gt; {
        const gpsData = {
            lat: coords.latitude,
            long: coords.longitude
        };
        setGps(gpsData);
        Swal.close(); // 위치정보 세팅 후 모달 닫기
    };
    const error = (err) =&amp;gt; {
        if (err.code === err.PERMISSION_DENIED) {
            swal('warning', '위치 정보를 제공하지 않으면 일부 기능을 사용할 수 없습니다.');
            return;
        } else {
            swal('error', '위치 정보를 가져오는 중 오류가 발생했습니다.');
            return;
        }
    };
    const getUserLocation = () =&amp;gt; {
        if (!navigator.geolocation) {
            swal('error', '위치정보가 지원되지 않습니다');
            return;
        } else {
            Swal.fire({
                title: '위치 정보 가져오는 중',
                text: '당신의 위치로 이동 중  &amp;zwj;♀️',
                allowOutsideClick: false,
                showLoaderOnConfirm: false,
                showCancelButton: false,
                showConfirmButton: false
            });
            navigator.geolocation.getCurrentPosition(success, error);
        }
    };
    getUserLocation();
}, [setGps, gps]);


// 최초 실행
useEffect(() =&amp;gt; {
    const mapDiv = document.getElementById('map01');
    if (mapDiv) initializeMap(INITIAL_CENTER);
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    if (searchInput &amp;amp;&amp;amp; searchButton) {
        setSearchInput(searchInput);
        setSearchButton(searchButton);
    }
}, [initializeMap]);

// 사용자 gps 값 저장 성공시 실행
useEffect(() =&amp;gt; {
    if (gps &amp;amp;&amp;amp; basicMarker &amp;amp;&amp;amp; mapRef.current &amp;amp;&amp;amp; window.naver) {
        mapRef.current.setCenter(new window.naver.maps.LatLng(gps.lat, gps.long));
        basicMarkerRef.current
            .setPosition(new window.naver.maps.LatLng(gps.lat, gps.long));
    }
}, [gps, basicMarker, mapRef]);

// 기본 정보창 객체 생성(만약 state 초기화에서 실패했을 수도 있으니까..)
useEffect(() =&amp;gt; {
    if (!infoWindow &amp;amp;&amp;amp; window.naver) {
        const infoWindow = new window.naver.maps.InfoWindow();
        setInfoWindow(infoWindow);
    }
}, [infoWindow]);

// 기본 마커 클릭시 동작 
useEffect(() =&amp;gt; {
    let listener = null;
    if (basicMarker &amp;amp;&amp;amp; gps &amp;amp;&amp;amp; infoWindow 
        &amp;amp;&amp;amp; mapRef.current &amp;amp;&amp;amp; setMakeGatherButtonDom &amp;amp;&amp;amp; window.naver) {
        listener = window.naver.maps.Event.addListener(basicMarker, 
            'click', () =&amp;gt; {
                if (!selectedGeoData) {
                    searchCoordinateToAddress(
                        infoWindow,
                        mapRef.current,
                        { y: gps.lat, x: gps.long },
                        setMakeGatherButtonDom,
                        setSelectedGeoData,
                        basicMarker
                    );
                }
            });
    }
    return () =&amp;gt; {
        if (listener) window.naver.maps.Event.removeListener(listener);
    };
}, [
        basicMarker, 
        selectedGeoData, 
        gps, 
        infoWindow, 
        mapRef, 
        setMakeGatherButtonDom, 
        setSelectedGeoData
    ]
);

// 정보창객체와 맵 객체가 설정되면 initGeocoder 실행
useEffect(() =&amp;gt; {
    if (infoWindow &amp;amp;&amp;amp; mapRef.current &amp;amp;&amp;amp; basicMarker &amp;amp;&amp;amp; user) {
        initGeocoder(
            infoWindow,
            mapRef.current,
            searchInput,
            searchButton,
            basicMarkerRef.current,
            setSelectedGeoData,
            setMakeGatherButtonDom,
            user
        );
    }
}, [
    infoWindow,
    mapRef,
    searchInput,
    searchButton,
    gps,
    basicMarkerRef,
    setSelectedGeoData,
    setMakeGatherButtonDom,
    user
]);

return {
    gps,
    naverMap: mapRef.current,
    infoWindow,
    basicMarker,
    makeGatherButtonDom,
    selectedGeoData,
    initializeMap
};
</code></pre>
<p>}</p>
<p>export default useMap;</code></pre></p>
<h3 data-ke-size="size23">MainPage</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>여기는 좀 복잡한게 맞는 것 같습니다 ㅠㅠ</li>
<li>리팩토링이 전혀 안되어있지만 일단 기록용으로 남겨 놓습니다.</li>
<li>하드코딩이 좀 많습니다.</li>
<li>나머지는 2편에...</li>
</ul>
<pre class="javascript" data-ke-language="javascript"><code>function Mainpage({ user = null, contracts = [] }) {
    const navigate = useNavigate();
    const searchInputRef = useRef();
    const searchButtonRef = useRef();
    const [openCreateGroupModal, setCreateGroupModal] = useState(false);
    const { 
        naverMap, 
        basicMarker, 
        infoWindow, 
        makeGatherButtonDom, 
        selectedGeoData 
    } = useMap();
    const { places } = usePlaces();
    const queryClient = useQueryClient();
    const prevPlacesRef = useRef(null);
    const allInfoWindowsRef = useRef(null);
    const allMarkersRef = useRef(null);
<pre><code>const handleModalClose = async () =&amp;gt; {
    setCreateGroupModal((prev) =&amp;gt; !prev);
    await queryClient.invalidateQueries({ queryKey: ['places'] });
    if (infoWindow) infoWindow.close();
    setTimeout(() =&amp;gt; {
        if (prevPlacesRef.current.length !== places.length) {
            allInfoWindowsRef.current[0].open(naverMap, allMarkersRef.current[0]);
            allMarkersRef.current[0].setMap(naverMap);
            const infoWindowInnerContent = 
                allInfoWindowsRef.current[0].getContentElement();
            const infoWindowOuterContent 
                = infoWindowInnerContent.parentNode.parentNode;
                infoWindowInnerContent.parentNode.style.width = 'fit-content';
                infoWindowInnerContent.parentNode.style.height = 'fit-content';
                infoWindowInnerContent.parentNode.style.minWidth 
                    = isMobile() ? '250px' : '370px';
                infoWindowInnerContent.parentNode.style.maxWidth 
                    = isMobile() ? '250px' : '370px';
                infoWindowInnerContent.parentNode.style.fontSize 
                    = isMobile() ? '9px' : '14px';
                infoWindowOuterContent.style.top =
                infoWindowInnerContent.getBoundingClientRect()
                    .height &amp;lt; 81 ? '-96px' : '-110px';
        }
    }, 0);
};

useEffect(() =&amp;gt; {
    if (places &amp;amp;&amp;amp; naverMap &amp;amp;&amp;amp; user &amp;amp;&amp;amp; contracts) {
        prevPlacesRef.current = places;
        // 마커 리스트와 정보창 리스트 선언
        const markers = [];
        const infoWindows = [];

        places.forEach((place) =&amp;gt; {
            const marker = new window.naver.maps.Marker({
                // 생성될 마커의 위치
                position: new window.naver.maps.LatLng(place.lat, place.long),
                // 마커를 표시할 Map 객체
                map: naverMap
            });

            // 정보창 객체
            const infoWindow = new window.naver.maps.InfoWindow({
                maxWidth: 300,
                anchorSize: {
                    width: 10,
                    height: 12
                },
                borderColor: '#cecdc7'
            });

            // setInfoWindowContent 함수 호출
            const container = 
                SetInfoWindowContent(
                    'place', 
                    '', 
                    '', 
                    infoWindow, 
                    place, 
                    navigate, 
                    marker, 
                    user, 
                    contracts
                );
            infoWindow.setContent(container);
            setTimeout(() =&amp;gt; {
                const infoWindowInnerContent = infoWindow.getContentElement();
                infoWindowInnerContent.parentNode.style.width = 'fit-content';
                infoWindowInnerContent.parentNode.style.height = 'fit-content';
                infoWindowInnerContent.parentNode.style.minWidth 
                    = isMobile() ? '250px' : '440px';
                infoWindowInnerContent.parentNode.style.maxWidth 
                    = isMobile() ? '250px' : '440px';
                infoWindowInnerContent.parentNode.style.fontSize 
                    = isMobile() ? '9px' : '14px';
            }, 0);
            marker.place = place;
            markers.push(marker);
            infoWindows.push(infoWindow);
        });

        allMarkersRef.current = markers;
        allInfoWindowsRef.current = infoWindows;

        // 마커 리스트와 정보창 리스너 등록
        markers.forEach((marker, idx) =&amp;gt; {
            marker.addListener('click', () =&amp;gt; {
                if (basicMarker) basicMarker.setMap(null);
                infoWindows[idx].open(naverMap, marker);
                naverMap.panTo(
                    new window.naver.maps.LatLng(
                        marker.position._lat, 
                        marker.position._lng
                    ), 
                    { duration: 200 }
                );
            });
        });

        // 지도 줌 인/아웃 시 마커 업데이트 이벤트 핸들러
        window.naver.maps.Event.addListener(naverMap, 'zoom_changed', () =&amp;gt; {
            if (naverMap !== null) checkForMarkersRendering(naverMap, markers);
        });

        // 지도 드래그 시 마커 업데이트 이벤트 핸들러
        window.naver.maps.Event.addListener(naverMap, 'dragend', () =&amp;gt; {
            if (naverMap !== null) checkForMarkersRendering(naverMap, markers);
        });
    }
}, [places, naverMap, basicMarker, navigate, user, contracts]);

// 모임만들기 버튼 클릭시 동작 
useEffect(() =&amp;gt; {
    const handleSelectButtonDom = () =&amp;gt; setCreateGroupModal((prev) =&amp;gt; !prev);
    if (makeGatherButtonDom) 
        makeGatherButtonDom.addEventListener('click', handleSelectButtonDom);

    return () =&amp;gt; {
        if (makeGatherButtonDom) 
            makeGatherButtonDom
            .removeEventListener('click', handleSelectButtonDom);
    };
}, [makeGatherButtonDom, selectedGeoData]);

return (
    &amp;lt;&amp;gt;
        {openCreateGroupModal &amp;amp;&amp;amp; &amp;lt;CreateGroupModal close={handleModalClose} /&amp;gt;}
        &amp;lt;section className=&quot;relative flex w-dvw h-dvh&quot;&amp;gt;
            &amp;lt;form className=&quot;sm:left-[15%] md:left-[10%] lg:left-[7%] absolute z-10 flex items-center gap-1 rounded-lg bg-white p-1 border border-gray-300 box-border left-5 top-5 ml-1&quot;&amp;gt;
                &amp;lt;input
                    type=&quot;text&quot;
                    id=&quot;search-input&quot;
                    className=&quot;bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 py-[3px] px-2&quot;
                    ref={searchInputRef}
                    placeholder=&quot;위치를 입력해주세요.&quot;
                /&amp;gt;
                &amp;lt;button
                    type=&quot;submit&quot;
                    id=&quot;search-button&quot;
                    className=&quot;bg-btn-blue hover:bg-blue-4000 text-white font-bold py-1 px-3 rounded text-xs&quot;
                    ref={searchButtonRef}
        &amp;gt;                        
                위치검색
                &amp;lt;/button&amp;gt;
            &amp;lt;/form&amp;gt;
            &amp;lt;div id=&quot;map01&quot; className=&quot;h-full w-full&quot; /&amp;gt;
        &amp;lt;/section&amp;gt;
    &amp;lt;/&amp;gt;
);
</code></pre>
<p>}</p>
<p>export default Mainpage;</code></pre></p>
