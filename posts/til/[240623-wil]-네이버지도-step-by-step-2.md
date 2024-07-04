<p>리팩토링은 미래의 나에게.. ㅋㅋ<br>참고용으로만 올려야겠습니다.</p>
<h2>네이버지도 with React - Step by Step 2</h2>
<h3>initGeocoder.js</h3>
<pre><code class="language-javascript">function initGeocoder(
    infoWindow,
    map,
    searchInputRef,
    searchButtonRef,
    marker,
    setSelectedGeoData,
    setSelectButtonDom,
    user
) {
<p>map.addListener('click', (e) =&gt; {
searchCoordinateToAddress(
infoWindow,
map,
e.coord,
setSelectButtonDom,
setSelectedGeoData,
marker,
user
);
marker.setMap(map);
marker.setPosition(e.coord);
});</p>
<p>searchInputRef.addEventListener('keydown', (e) =&gt; {
let keyCode = e.which;
if (keyCode === 13) {
searchAddressToCoordinate(
infoWindow,
searchInputRef,
map,
setSelectedGeoData,
setSelectButtonDom,
marker,
user
);
}
});</p>
<p>searchButtonRef.addEventListener('click', (e) =&gt; {
e.preventDefault();
searchAddressToCoordinate(
infoWindow,
searchInputRef,
map,
setSelectedGeoData,
setSelectButtonDom,
marker,
user
);
});
}</p>
<p>export default initGeocoder;</code></pre></p>
<h3>coordToAddress.js</h3>
<pre><code class="language-javascript">// 좌표기반(지도상 아무 위치 클릭) 마커 및 정보창 열기
function searchCoordinateToAddress(
infoWindow, 
map,
 latlng, 
 setSelectButtonDom, 
 setSelectedGeoData, 
 marker, 
 user
) {
    infoWindow.close();
    window.naver.maps.Service.reverseGeocode(
        {
            coords: latlng,
            orders: [window.naver.maps.Service.OrderType.ADDR, 
            window.naver.maps.Service.OrderType.ROAD_ADDR].join(&#39;,&#39;)
        },
        function (status, response) {
            if (status === window.naver.maps.Service.Status.ERROR) {
                swal(&#39;error&#39;, &#39;Something Wrong!&#39;);
                return;
            }
<pre><code>        let items = response.v2.results,
        address = &amp;#39;&amp;#39;,
        htmlAddresses = [];

        for (let i = 0, ii = items.length, item, addrType; i &amp;lt; ii; i++) {
            item = items[i];
            address = makeAddress(item) || &amp;#39;&amp;#39;;
            addrType = item.name === &amp;#39;roadaddr&amp;#39; ? &amp;#39;[도로명 주소]&amp;#39; : &amp;#39;[지번 주소]&amp;#39;;
            htmlAddresses.push(i + 1 + &amp;#39;. &amp;#39; + addrType + &amp;#39; &amp;#39; + address);
        }

        setSelectedGeoData({
            address: {
                jibunAddress: htmlAddresses[0]?.substring(11),
                roadAddress: htmlAddresses[1]?.substring(12)
            },
            coord: { lat: latlng.y, long: latlng.x }
        });

        // setInfoWindowContent 함수 호출
        const container = SetInfoWindowContent(
            &amp;#39;address&amp;#39;, 
            &amp;#39;&amp;#39;, 
            htmlAddresses, 
            infoWindow, 
            null, 
            null, 
            marker, 
            user
        );

        infoWindow.setContent(container);
        infoWindow.setOptions({
            anchorSkew: false,
            borderColor: &amp;#39;#cecdc7&amp;#39;,
            anchorSize: {
                width: 10,
                height: 12
            }
        });

        let centerPosition = marker.getPosition();
        centerPosition = {
            x: centerPosition.x + 0.001,
            y: centerPosition.y,
            _lat: centerPosition._lat,
            _long: centerPosition._long + 0.001
        };

        map.setCenter(isMobile() ? centerPosition : marker.getPosition());
        infoWindow.open(map, marker.getPosition());

        setTimeout(() =&amp;gt; {
            const infoWindowInnerContent = infoWindow.getContentElement();
            const infoWindowOuterContent 
                = infoWindowInnerContent.parentNode.parentNode;

            infoWindowInnerContent.parentNode.style.width = &amp;#39;fit-content&amp;#39;;
            infoWindowInnerContent.parentNode.style.height = &amp;#39;fit-content&amp;#39;;
            infoWindowInnerContent.parentNode.style.minWidth 
                = isMobile() ? &amp;#39;250px&amp;#39; : &amp;#39;370px&amp;#39;;
            infoWindowInnerContent.parentNode.style.maxWidth 
                = isMobile() ? &amp;#39;250px&amp;#39; : &amp;#39;370px&amp;#39;;
            infoWindowInnerContent.parentNode.style.fontSize 
                = isMobile() ? &amp;#39;9px&amp;#39; : &amp;#39;14px&amp;#39;;

            infoWindowOuterContent.style.top =
            infoWindowInnerContent.getBoundingClientRect()
                .height &amp;lt; 81 ? &amp;#39;-88px&amp;#39; : &amp;#39;-110px&amp;#39;;

            setSelectButtonDom(
                infoWindowInnerContent.querySelector(&amp;#39;#selectCoord&amp;#39;)
            );
        }, 0);
    }
);
</code></pre>
<p>}</p>
<p>export default searchCoordinateToAddress;</code></pre></p>
<h3>AddressToCoord.js</h3>
<pre><code class="language-javascript">// 검색기반 마커/정보창 열기
function searchAddressToCoordinate(
    infoWindow,
    searchInputRef,
    map,
    setSelectedGeoData,
    setSelectButtonDom,
    marker,
    user
) {
    const searchedValue = searchInputRef.value;
<pre><code>if (!searchedValue) {
    swal(&amp;#39;error&amp;#39;, &amp;#39;검색어를 입력해주세요&amp;#39;);
    return;
}
window.naver.maps.Service.geocode(
    {
        query: searchedValue
    },
    function (status, response) {
        if (status === window.naver.maps.Service.Status.ERROR) {
            swal(&amp;#39;error&amp;#39;, &amp;#39;Something Wrong!&amp;#39;);
            return;
        }

        if (response.v2.meta.totalCount === 0) {
            swal(&amp;#39;error&amp;#39;, `검색결과가 없습니다. 결과 ${response.v2.meta.totalCount}건`);
            return;
        }

        let htmlAddresses = [],
        item = response.v2.addresses[0],
        point = new window.naver.maps.Point(item.x, item.y);

        if (item.roadAddress) {
            htmlAddresses.push(&amp;#39;[도로명 주소] &amp;#39; + item.roadAddress);
        }

        if (item.jibunAddress) {
            htmlAddresses.push(&amp;#39;[지번 주소] &amp;#39; + item.jibunAddress);
        }

        if (item.englishAddress) {
            htmlAddresses.push(&amp;#39;[영문명 주소] &amp;#39; + item.englishAddress);
        }

        // item.y === lat / item.x === long
        setSelectedGeoData({
            address: {
                jibunAddress: htmlAddresses[1]?.substring(8),
                roadAddress: htmlAddresses[0]?.substring(9)
            },
            coord: { lat: Number(item.y), long: Number(item.x) }
        });

        // setInfoWindowContent 함수 호출
        const container = SetInfoWindowContent(
            &amp;#39;address&amp;#39;,
            searchedValue,
            htmlAddresses,
            infoWindow,
            null,
            null,
            marker,
            user
        );

        infoWindow.setContent(container);
        infoWindow.setOptions({
            anchorSkew: false,
            borderColor: &amp;#39;#cecdc7&amp;#39;,
            anchorSize: {
                width: 10,
                height: 12
            }
        });

        marker.setMap(map);
        marker.setPosition(point);

        let centerPosition = point;
        centerPosition = {
            x: centerPosition.x + 0.001, // 모바일에서 안짤리게 해볼려구...
            y: centerPosition.y,
            _lat: centerPosition._lat,
            _long: centerPosition._long + 0.001
        };

        map.setCenter(isMobile() ? centerPosition : point);
        infoWindow.open(map, point);
        setTimeout(() =&amp;gt; {
            const infoWindowInnerContent = infoWindow.getContentElement();
            const infoWindowOuterContent 
                = infoWindowInnerContent.parentNode.parentNode;

            infoWindowInnerContent.parentNode.style.width = &amp;#39;fit-content&amp;#39;;
            infoWindowInnerContent.parentNode.style.height = &amp;#39;fit-content&amp;#39;;
            infoWindowInnerContent.parentNode.style.minWidth 
                = isMobile() ? &amp;#39;250px&amp;#39; : &amp;#39;400px&amp;#39;;
            infoWindowInnerContent.parentNode.style.maxWidth 
                = isMobile() ? &amp;#39;250px&amp;#39; : &amp;#39;400px&amp;#39;;
            infoWindowInnerContent.parentNode.style.fontSize 
                = isMobile() ? &amp;#39;9px&amp;#39; : &amp;#39;14px&amp;#39;;

            infoWindowOuterContent.style.top =
            infoWindowInnerContent.getBoundingClientRect()
                .height &amp;lt; 100 ? &amp;#39;-88px&amp;#39; : &amp;#39;-130px&amp;#39;;

            setSelectButtonDom(
                infoWindowInnerContent.querySelector(&amp;#39;#selectCoord&amp;#39;)
            );
            searchInputRef.value = &amp;#39;&amp;#39;;
        }, 0);
    }
);
</code></pre>
<p>}</p>
<p>export default searchAddressToCoordinate;</code></pre></p>
<h3>makeAddress.js</h3>
<pre><code class="language-javascript">// 주소 문자열 반환
function makeAddress(item) {
    if (!item) {
        return;
    }
<pre><code>const name = item.name,
region = item.region,
land = item.land,
isRoadAddress = name === &amp;#39;roadaddr&amp;#39;;

let sido = &amp;#39;&amp;#39;,
sigugun = &amp;#39;&amp;#39;,
dongmyun = &amp;#39;&amp;#39;,
ri = &amp;#39;&amp;#39;,
rest = &amp;#39;&amp;#39;;

if (hasArea(region.area1)) sido = region.area1.name;

if (hasArea(region.area2)) sigugun = region.area2.name;

if (hasArea(region.area3)) dongmyun = region.area3.name;

if (hasArea(region.area4)) ri = region.area4.name;

if (land) {
    if (hasData(land.number1)) {
        if (hasData(land.type) &amp;amp;&amp;amp; land.type === &amp;#39;2&amp;#39;) rest += &amp;#39;산&amp;#39;;

        rest += land.number1;

        if (hasData(land.number2)) rest += &amp;#39;-&amp;#39; + land.number2;

    }

    if (isRoadAddress === true) {
        if (checkLastString(dongmyun, &amp;#39;면&amp;#39;)) {
            ri = land.name;
        } else {
            dongmyun = land.name;
            ri = &amp;#39;&amp;#39;;
        }

        if (hasAddition(land.addition0)) rest += &amp;#39; &amp;#39; + land.addition0.value;
    }
}

return [sido, sigugun, dongmyun, ri, rest].join(&amp;#39; &amp;#39;);
</code></pre>
<p>}</p>
<p>function hasArea(area) {
return !!(area &amp;&amp; area.name &amp;&amp; area.name !== '');
}</p>
<p>function hasData(data) {
return !!(data &amp;&amp; data !== '');
}</p>
<p>function checkLastString(word, lastString) {
return new RegExp(lastString + '$').test(word);
}</p>
<p>function hasAddition(addition) {
return !!(addition &amp;&amp; addition.value);
}</p>
<p>export default makeAddress;</code></pre></p>
<h3>checkForMarkersRendering.js</h3>
<pre><code class="language-javascript">// 마커 표시 함수
const showMarker = (map, marker) =&gt; marker.setMap(map);
<p>// 마커 숨김 함수
const hideMarker = (marker) =&gt; marker.setMap(null);</p>
<p>// 마커가 보이는 지도화면 밖으로 나가면 숨기고 들어오면 표시하는 기능
const checkForMarkersRendering = (map, markers) =&gt; {
const mapBounds = map.getBounds();</p>
<pre><code>for (let i = 0; i &amp;lt; markers.length; i += 1) {
    const position = markers[i].getPosition();

    if (mapBounds.hasLatLng(position)) {
        showMarker(map, markers[i]);
    } else {
        hideMarker(markers[i]);
    }
}
</code></pre>
<p>};</p>
<p>export default checkForMarkersRendering;</code></pre></p>
