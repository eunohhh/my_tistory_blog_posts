<h2 data-ke-size="size26"><b>  OpenAI Responses API로 이미지 생성 결과 스트리밍 받기</b></h2>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>OpenAI에서 제공하는 responses API를 이용하면 이제 <b>텍스트 프롬프트로 이미지 생성</b>을 요청할 수 있고, 이를 <b>스트리밍 형식으로 단계별로 수신</b>할 수 있습니다.</li>
<li>Next.js와 TanStack Query의 streamedQuery 기능을 활용해 실시간으로 이미지를 받아 UI에 바로 반영하는 방식을 정리합니다.</li>
</ul>
<h2 data-ke-size="size26"><b>  시스템 구성</b></h2>
<h3 data-ke-size="size23"><b>✅ 주요 기술 스택</b></h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li><b>OpenAI SDK (openai)</b>: responses.create를 통해 이미지 스트리밍 요청</li>
<li><b>Next.js Route Handler</b>: 서버 측에서 OpenAI 응답을 ReadableStream으로 래핑</li>
<li><b>TanStack Query (useQuery + streamedQuery)</b>: 클라이언트에서 스트림 수신 및 상태 관리</li>
<li><b>Async Generator (getGenTxtToImgStream)</b>: 응답 스트림을 비동기 반복(iteration)으로 분할 처리</li>
</ul>
<p data-ke-size="size16">&nbsp;</p>
<h3 data-ke-size="size23"> ️ route handler</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>OpenAI로부터 받은 이미지 스트리밍 응답을 개별 JSON 라인(jsonl) 형식으로 브라우저에 전달합니다.</li>
<li>stream: true와 함께 partial_images: 3 설정 시, 최대 4개의 응답 이벤트 수신 가능</li>
<li>각 응답은 \n으로 구분된 JSON 문자열로 직렬화되어 전달됨</li>
<li>X-Content-Type-Options: nosniff로 MIME 스니핑 방지</li>
</ul>
<pre class="typescript" data-ke-language="typescript"><code>import { type NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
<p>const openaiApiKey = process.env.OPENAI_API_KEY;
if (!openaiApiKey) {
throw new Error(&quot;Missing environment variable OPENAI_API_KEY&quot;);
}</p>
<p>const openai = new OpenAI({ apiKey: openaiApiKey });</p>
<p>export async function GET(request: NextRequest) {
const { searchParams } = new URL(request.url);
const prompt = searchParams.get(&quot;prompt&quot;); // 쿼리스트링에서 프롬프트 가져오기
const model = searchParams.get(&quot;model&quot;); // 쿼리스트링에서 모델 가져오기</p>
<p>if (!prompt) {
return NextResponse.json({ error: &quot;Prompt is required&quot; }, { status: 400 });
}</p>
<p>try {
const imageStream = await openai.responses.create({
model: model || &quot;gpt-4o-mini&quot;,
input: prompt,
stream: true, // 스트림으로 받겠다
tools: [
{
type: &quot;image_generation&quot;,
partial_images: 3, // 최대 3회 -&gt; 총 4번에 걸쳐 옴
size: &quot;1024x1024&quot;,
quality: &quot;medium&quot;,
},
],
});</p>
<pre><code>const encoder = new TextEncoder();

const readableStream = new ReadableStream({
  async start(controller) {
    for await (const event of imageStream) {
      let outputIndex = 0;
      // 이미지 생성 중 단계일 때
      if (event.type === &quot;response.image_generation_call.partial_image&quot;) {
        const imageBase64 = event.partial_image_b64;
        outputIndex = event.partial_image_index;
        const responseObject = {
          output_index: event.partial_image_index,
          partial_image_b64s: [imageBase64],
          usage: null,
          status: &quot;partial&quot;,
          final_model: null,
        };
        controller.enqueue(
          encoder.encode(`${JSON.stringify(responseObject)}\n`)
        );
      } else if ( // 생성 완료시인데 여기서 처리하기 보다 아래 response.completed 에서 처리
        event.type === &quot;response.image_generation_call.completed&quot;
      ) {
        // do nothing
      } else if (event.type === &quot;response.completed&quot;) { // response 완료
        const completedObj = event.response.output.find(
          (item) =&amp;gt; item.type === &quot;image_generation_call&quot;
        );
        const imageBase64 = completedObj ? completedObj.result : null;
        const responseObject = {
          output_index: outputIndex + 1,
          partial_image_b64s: imageBase64 ? [imageBase64] : [],
          usage: event.response.usage || null,
          status: &quot;completed&quot;,
          final_model: event.response.model,
        };
        controller.enqueue(
          encoder.encode(`${JSON.stringify(responseObject)}\n`)
        );
      } else if (event.type === &quot;error&quot;) {
        console.error(&quot;OpenAI Stream Error Code:&quot;, (event as any).code);
        console.error(
          &quot;OpenAI Stream Error Message:&quot;,
          (event as any).message
        );
        console.error(&quot;OpenAI Stream Error Param:&quot;, (event as any).param);
        const errorObject = {
          error: true,
          message: (event as any).message || &quot;OpenAI stream error&quot;,
          code: (event as any).code,
          param: (event as any).param,
        };
        controller.enqueue(
          encoder.encode(`${JSON.stringify(errorObject)}\n`)
        );
        controller.error(
          new Error((event as any).message || &quot;OpenAI stream error&quot;)
        );
        return;
      }
    }
    controller.close();
  },
  cancel() {
    console.log(&quot;Stream cancelled by client.&quot;);
  },
});

return new Response(readableStream, {
  headers: {
    &quot;Content-Type&quot;: &quot;application/jsonl; charset=utf-8&quot;,
    &quot;X-Content-Type-Options&quot;: &quot;nosniff&quot;,
    &quot;Cache-Control&quot;: &quot;no-cache&quot;,
  },
});
</code></pre>
<p>} catch (error) {
console.error(&quot;Error generating image stream:&quot;, error);
const errorMessage =
error instanceof Error ? error.message : &quot;Unknown error occurred&quot;;
return NextResponse.json(
{ error: &quot;Failed to generate image stream&quot;, details: errorMessage },
{ status: 500 }
);
}
}</code></pre></p>
<p data-ke-size="size16">&nbsp;</p>
<h3 data-ke-size="size23">  api 함수</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>서버로부터 전달된 ReadableStream을 받아 비동기적으로 yield하여 쪼개진 이미지 데이터를 순차적으로 처리합니다.</li>
<li>UTF-8 디코딩 후 \n 기준으로 줄 단위 JSON 파싱</li>
<li>AsyncIterable 형식으로 반환되어 TanStack Query의 streamedQuery에서 바로 사용 가능</li>
</ul>
<pre class="typescript" data-ke-language="typescript"><code>import type {
  IGenTxtImgToTxtStreamData,
  IGenTxtToImgStreamData,
} from "../_hooks/query.hooks";
<p>export async function* getGenTxtToImgStream(
model: string,
prompt: string
): AsyncIterable&lt;IGenTxtToImgStreamData&gt; {
if (!prompt) return;</p>
<p>const response = await fetch(
<code>/api/gen/txttoimg?model=${model}&amp;amp;prompt=${encodeURIComponent(prompt)}</code>
);</p>
<p>if (!response.ok) {
let errorData = { error: <code>HTTP error! status: ${response.status}</code> };
try {
const text = await response.text();
errorData = JSON.parse(text);
} catch (e) {
console.error(&quot;Failed to parse error JSON:&quot;, e);
}
throw new Error(
(errorData as any).message ||
errorData.error ||
<code>HTTP error! status: ${response.status}</code>
);
}</p>
<p>if (!response.body) {
throw new Error(&quot;Response body is null&quot;);
}</p>
<p>const reader = response.body.getReader();
const decoder = new TextDecoder();
let buffer = &quot;&quot;;</p>
<p>try {
while (true) {
const { done, value } = await reader.read();
if (done) break;</p>
<pre><code>  buffer += decoder.decode(value, { stream: true });

  let eolIndex = buffer.indexOf(&quot;\n&quot;);
  while (eolIndex !== -1) {
    const line = buffer.substring(0, eolIndex);
    buffer = buffer.substring(eolIndex + 1);
    if (line.trim().length &amp;gt; 0) {
      try {
        yield JSON.parse(line.trim());
      } catch (e) {
        console.error(&quot;Failed to parse JSON line:&quot;, line, e);
      }
    }
    eolIndex = buffer.indexOf(&quot;\n&quot;);
  }
}
if (buffer.trim().length &amp;gt; 0) {
  try {
    yield JSON.parse(buffer.trim());
  } catch (e) {
    console.error(
      &quot;Failed to parse JSON line (remaining buffer):&quot;,
      buffer,
      e
    );
  }
}
</code></pre>
<p>} finally {
reader.releaseLock();
}
}</code></pre></p>
<p data-ke-size="size16">&nbsp;</p>
<h3 data-ke-size="size23">  steamedQuery</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>streamedQuery는 내부적으로 for await...of로 데이터를 수신</li>
<li>수신된 이미지 데이터는 React state나 UI에서 사용 가능</li>
</ul>
<pre class="typescript" data-ke-language="typescript"><code>export interface IGenTxtToImgStreamData {
  output_index: number;
  partial_image_b64s: string[];
  usage: IOpenAIResponseUsage | null;
  status: "partial" | "completed";
  final_model: string | null;
}
<p>interface IGenTxtToImgQueryProps {
prompt: string | null;
model: string;
mode: Mode;
}</p>
<p>type TQueryKey = readonly (string | null)[];</p>
<p>export const useGenTxtToImgQuery = ({
prompt,
model,
mode,
}: IGenTxtToImgQueryProps) =&gt; {
return useQuery&lt;
IGenTxtToImgStreamData[],
Error,
IGenTxtToImgStreamData[],
TQueryKey
&gt;({
queryKey: [QUERY_KEY_GEN_TXT_TO_IMG, prompt, model],
// streamedQuery의 queryFn은 QueryFunctionContext를 인자로 받고,
// AsyncIterable을 반환해야 합니다.
// streamedQuery 자체가 useQuery의 queryFn으로 사용될 수 있는 함수를 반환합니다.
queryFn: streamedQuery({
queryFn: (context: QueryFunctionContext&lt;TQueryKey&gt;) =&gt; {
const [, currentPrompt, currentModel] = context.queryKey;
if (typeof currentPrompt === &quot;string&quot; &amp;&amp; currentPrompt) {
return getGenTxtToImgStream(
currentModel || &quot;gpt-4o-mini&quot;,
currentPrompt
) as AsyncIterable&lt;IGenTxtToImgStreamData&gt;;
}
// currentPrompt가 유효하지 않으면 빈 AsyncIterable을 반환합니다.
// 즉시 완료되는 비동기 제너레이터 함수를 반환합니다.
return (async function* () {})();
},
}),
enabled: !!prompt &amp;&amp; !!model &amp;&amp; mode === &quot;txt-to-image&quot;,
});
};</code></pre></p>
<p data-ke-size="size16">&nbsp;</p>
<h3 data-ke-size="size23"> ️ 4. UI에서 실시간 이미지 업데이트</h3>
<ul style="list-style-type: disc;" data-ke-list-type="disc">
<li>status: "partial"이면 순차적으로 이미지 업데이트</li>
<li>status: "completed"일 때 최종 이미지 + usage 정보 수신</li>
</ul>
<pre class="typescript" data-ke-language="typescript"><code>"use client";
<p>interface MarkdownProps {
children: React.ReactNode;
node: React.ReactNode;
}</p>
<p>const formSchema = z.object({
message: z.string(),
});</p>
<p>function Chat() {
const [prompt, setPrompt] = useState&lt;string | null&gt;(null);
const [generatedImage, setGeneratedImage] = useState&lt;string | null&gt;(null);
const { user } = useAuth();
const { mode, model, base, setUsage } = useUsageCalculatorStore(
useShallow((state) =&gt; ({
base: state.base,
mode: state.mode,
model: state.model,
setUsage: state.setUsage,
}))
);
const form = useForm&lt;z.infer&lt;typeof formSchema&gt;&gt;({
resolver: zodResolver(formSchema),
defaultValues: {
message: &quot;&quot;,
},
});</p>
<p>const {
messages,
input,
handleInputChange,
handleSubmit: handleChatSubmit,
setInput,
} = useChat({
onFinish: (message, options) =&gt; {
setUsage(options.usage);
},
});</p>
<p>const {
data: txtToImgData,
status: txtToImgImagesStatus,
fetchStatus: txtToImgImagesFetchStatus,
error: txtToImgImagesError,
} = useGenTxtToImgQuery({
prompt,
model,
mode,
});</p>
<p>const messagesEndRef = useRef&lt;HTMLDivElement&gt;(null);
const countRef = useRef&lt;number&gt;(0);</p>
<p>const resetAll = () =&gt; {
setInput(&quot;&quot;);
form.reset({ message: &quot;&quot; });
form.clearErrors(&quot;message&quot;);
};</p>
<p>const handleSubmit = (data: z.infer&lt;typeof formSchema&gt;) =&gt; {
if (data.message.length &lt; 5) {
toast.error(&quot;메시지는 5자 이상이어야 합니다.&quot;);
return;
}
if (!user) {
toast.error(&quot;Please login to use the chat&quot;);
return;
}</p>
<pre><code>const selectedModel: Model = base.input_txt_base.model
  ? base.input_txt_base.model
  : base.input_image_base.model!;

if (mode === &quot;txt-to-image&quot;) {
  setPrompt(data.message);
  resetAll();
  return;
} else {
  handleChatSubmit(
    {},
    {
      body: {
        model: selectedModel,
      },
    }
  );
}

resetAll();
</code></pre>
<p>};</p>
<p>const handleKeyDown = (e: React.KeyboardEvent&lt;HTMLTextAreaElement&gt;) =&gt; {
if (e.nativeEvent.isComposing || isComposing) return;
if (e.key === &quot;Enter&quot;) {
e.preventDefault();
e.currentTarget.form?.requestSubmit();
}
};</p>
<p>useEffect(() =&gt; {
if (!txtToImgData || txtToImgData.length === 0) return;
if (countRef.current &lt; txtToImgData.length) {
setGeneratedImage(txtToImgData[countRef.current].partial_image_b64s[0]);
if (txtToImgData[countRef.current].status === &quot;partial&quot;) {
countRef.current++;
return;
}
if (txtToImgData[countRef.current].status === &quot;completed&quot;) {
setUsage(txtToImgData[txtToImgData.length - 1].usage ?? null);
countRef.current = 0;
return;
}
}
}, [txtToImgData, setUsage]);</p>
<p>return (
&lt;div className=&quot;w-full h-full flex flex-col gap-2&quot;&gt;
&lt;div className=&quot;w-full h-auto min-h-[calc(100%-74px)] flex flex-col gap-2 text-xs overflow-y-auto justify-center items-center&quot;&gt;
{txtToImgData &amp;&amp; txtToImgData.length &gt; 0 &amp;&amp; (
&lt;div className=&quot;w-[256px] h-[256px] rounded-lg overflow-hidden transition-shadow duration-300&quot;&gt;
&lt;img
src={<code>data:image/png;base64,${generatedImage}</code>}
alt={&quot;Generated content&quot;}
className=&quot;object-cover aspect-square&quot;
/&gt;
&lt;/div&gt;
)}</p>
<pre><code>    &amp;lt;div ref={messagesEndRef} /&amp;gt;
  &amp;lt;/div&amp;gt;

  &amp;lt;Form {...form}&amp;gt;
    &amp;lt;form
      onSubmit={form.handleSubmit(handleSubmit)}
      className=&quot;min-w-[680px] w-[90svw] h-[60px] lg:w-1/2 relative left-1/2 -translate-x-1/2&quot;
    &amp;gt;
      &amp;lt;FormField
        control={form.control}
        name=&quot;message&quot;
        render={({ field }) =&amp;gt; (
          &amp;lt;FormItem className=&quot;w-full space-y-0&quot;&amp;gt;
            &amp;lt;FormLabel className=&quot;hidden&quot;&amp;gt;Message&amp;lt;/FormLabel&amp;gt;
            &amp;lt;FormControl&amp;gt;
              &amp;lt;ChatTextArea
                value={input}
                onKeyDown={handleKeyDown}
                onCompositionStart={handleComposition}
                onCompositionEnd={handleComposition}
                onChange={(e) =&amp;gt; {
                  handleInputChange(e);
                  field.onChange(e);
                }}
              /&amp;gt;
            &amp;lt;/FormControl&amp;gt;
            &amp;lt;FormDescription className=&quot;hidden&quot;&amp;gt;
              This is your message.
            &amp;lt;/FormDescription&amp;gt;
            &amp;lt;FormMessage className=&quot;absolute bottom-0 left-2 text-[10px] text-red-400&quot; /&amp;gt;
          &amp;lt;/FormItem&amp;gt;
        )}
      /&amp;gt;

      &amp;lt;div className=&quot;absolute top-0 right-2 w-fll h-[60px] flex justify-center items-center&quot;&amp;gt;
        &amp;lt;div className=&quot;w-fit h-9 flex justify-center items-center&quot;&amp;gt;
          &amp;lt;Button
            variant=&quot;secondary&quot;
            type=&quot;submit&quot;
            className=&quot;h-full w-9 p-0 hover:bg-neutral-900&quot;
          &amp;gt;
            &amp;lt;Send className=&quot;!size-5&quot; /&amp;gt;
          &amp;lt;/Button&amp;gt;
        &amp;lt;/div&amp;gt;
      &amp;lt;/div&amp;gt;
    &amp;lt;/form&amp;gt;
  &amp;lt;/Form&amp;gt;
&amp;lt;/div&amp;gt;
</code></pre>
<p>);
}</p>
<p>export default Chat;</code></pre></p>
