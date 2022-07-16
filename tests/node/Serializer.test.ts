import "jasmine"
import { Serializer } from "../../src/Serializer"
import { Unserializer } from "../../src/Unserializer"

function justSerialize(v: any): string {
    let S = new Serializer()
    S.serialize(v)
    return S.toString()
}

function serializeAndUnserialize(v: any) {
    let S = new Serializer()
    S.serialize(v)
    let sres = S.toString()
    let U = new Unserializer(sres)
    return U.unserialize()
}

describe("Serializer", () => {
    it("does zero", () => {
        expect(justSerialize(0)).toEqual("z")
        expect(serializeAndUnserialize(0)).toEqual(0)
    })

    it("does booleans", () => {
        expect(serializeAndUnserialize(true)).toEqual(true)
        expect(serializeAndUnserialize(false)).toEqual(false)
    })

    it("does integers", () => {
        expect(serializeAndUnserialize(1)).toEqual(1)
        expect(serializeAndUnserialize(12341214)).toEqual(12341214)
    })

    it("does strings", () => {
        let s = "I really like serializing"
        expect(serializeAndUnserialize(s)).toEqual(s)
    })

    it("does weird strings", () => {
        let s1 = "ⒶⒷⒸⒹⒺⒻⒼ"
        let s2 = "𝑨𝑩𝑪𝑫𝑬𝑭𝑮"
        expect(serializeAndUnserialize(s1)).toEqual(s1)
        expect(serializeAndUnserialize(s2)).toEqual(s2)
    })

    it("does floats", () => {
        expect(serializeAndUnserialize(3272664.238)).toEqual(3272664.238)
        expect(serializeAndUnserialize(-23485.341)).toEqual(-23485.341)
    })

    it("does those weird numbers", () => {
        expect(justSerialize(NaN)).toBe("k")
        expect(justSerialize(Number.POSITIVE_INFINITY)).toBe("p")
        expect(justSerialize(Number.NEGATIVE_INFINITY)).toBe("m")
        expect(serializeAndUnserialize(NaN)).toEqual(NaN)
        expect(serializeAndUnserialize(Number.NEGATIVE_INFINITY)).toEqual(Number.NEGATIVE_INFINITY)
        expect(serializeAndUnserialize(Number.POSITIVE_INFINITY)).toEqual(Number.POSITIVE_INFINITY)
    })

    it("does string arrays", () => {
        let s = ["hi", "there", "world"]
        expect(justSerialize(s)).toEqual("ay2:hiy5:therey5:worldh")
        expect(serializeAndUnserialize(s)).toEqual(s)
    })

    it("does numeric arrays", () => {
        let s = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0]
        expect(serializeAndUnserialize(s)).toEqual(s)
    })

    it("does buffers", () => {
        let s = "Hello world from the serializer"
        let bytes = Buffer.from(s)
        expect(justSerialize(bytes)).toBe("s42:SGVsbG8gd29ybGQgZnJvbSB0aGUgc2VyaWFsaXplcg")
        expect(serializeAndUnserialize(bytes).toString()).toBe(s)
    })

    it("does dates", () => {
        let d = new Date(1602561002310) // 2020-10-13T03:50:02.310Z
        expect(justSerialize(d)).toBe("v2020-10-13 03:50:02")
        expect(serializeAndUnserialize(d).getTime()).toBe(1602561002000) // We lose milliseconds
    })

    it("does objects", () => {
        let s0 = { a: 1, b: "string" }
        let s1 = { a: 1, b: "string", c: [1, 2, 3, 4] }
        let s2 = { a: 1, b: "string", c: [1, 2, 3, 4], d: { a: 1, b: 3 } }
        expect(serializeAndUnserialize(s0)).toEqual(s0)
        expect(serializeAndUnserialize(s1)).toEqual(s1)
        expect(serializeAndUnserialize(s2)).toEqual(s2)
    })

    it("even does classes", () => {
        let a = new Apples()
        let serialized = justSerialize(a)
        expect(serialized).toBe("cy6:Applesy5:valuei5g")
        let U = new Unserializer(serialized)
        expect(() => U.unserialize()).toThrowError()
        // for security, in order to unserialize classes, they must be pre-registered.
        Unserializer.registerSerializableClass(Apples)
        U = new Unserializer(serialized)
        let newA: Apples = U.unserialize()
        expect(newA.value).toBe(5)
    })

    it("will never do functions", () => {
        expect(() => serializeAndUnserialize(justSerialize)).toThrowError()
    })

    it("big test", () => {
        const U = new Unserializer(
            "oy9:_freePlayfy13:_tutorialDataay0:y11:Tuto_Intro1y11:Tuto_Intro2y11:Tuto_Intro3y11:Tuto_Intro4y11:Tuto_Intro5y11:Tuto_Intro6y10:Tuto_Swap1y10:Tuto_Swap2y10:Tuto_Swap3y10:Tuto_Swap4y10:Tuto_Swap5y10:Tuto_Done1y10:Tuto_Done2y9:Tuto_Lifey9:Tuto_Timey11:Tuto_Debuffy8:Tuto_HQ1y8:Tuto_HQ2y8:Tuto_HQ3y8:Tuto_HQ4y21:Tuto_StudentQuestion1y21:Tuto_StudentQuestion2y13:Tuto_LowLife1y13:Tuto_LowLife2y9:Tuto_Buffy17:Tuto_StudentReplyy10:Tuto_Home1y10:Tuto_Home2y10:Tuto_Home3y9:Tuto_Pet1y9:Tuto_Pet2y14:Tuto_HomeCust1y9:Tuto_Hat1y9:Tuto_Hat2hy10:_actionUrly39:teacher-story.com%2Fgame%2FlessonActiony6:_extraoy15:_urlMissionDoney40:teacher-story.com%2Fgame%2FisMissionDoney7:_urlHaty26:teacher-story.com%2FsetHaty8:_urlBanky14:%2Fbank%2Fneedy8:_urlGifty18:%2Fgame%2FopenGifty8:_urlHomey37:teacher-story.com%2Fgame%2FupdateHomey8:_urlNexty17:%2Fgame%2Fresultsy11:_urlLevelUpy36:teacher-story.com%2Fgame%2FisLevelUpgy5:_goldi34609y5:_homeny9:_deliveryty5:_timeny3:_hpty8:_actionsahy7:_periodjy3:_tp:0:1jy3:_sb:2:0y11:_solverInitoy7:_launchai8hy12:_teacherDataoy7:_helperny2:_iaoy2:_xi5y2:_yi6goR68i5R69i4goR68i7R69i4goR68i4R69i6goR68i4R69i4goR68i4R69i2goR68i7R69i2ghy2:_li8y2:_oaoy2:_ni8R71jy8:_TObject:0:0goR72i9R71jR73:3:0goR72i9R71jR73:4:0ghy2:_pi10y2:_si22y3:_amfy3:_mpi10y3:_msi26y3:_ppzy3:_pri2y3:_ysi1898y6:_gradei1y10:_avHelpersny4:_actajy8:_TAction:0:0jR85:9:0jR85:4:0jR85:5:0jR85:3:0jR85:8:0jR85:7:0jR85:1:0jR85:2:0jR85:6:0jR85:10:0jR85:11:0jR85:13:0jR85:12:0jR85:30:0jR85:41:0jR85:26:0hy4:_cpsajy6:_TComp:48:0jR87:5:0jR87:40:0jR87:35:0jR87:19:0jR87:56:0jR87:36:0jR87:1:0hy4:_illny4:_lltzgy12:_leftActionsny8:_subjectjR62:2:0y9:_studentsaoy5:_giftny5:_latezy2:_fy13:Aur%C3%A9lieny2:_htR67i85049785R70i8y2:_mzR72d6.5R74oR68i4R69i2gy2:_rzy2:_uny3:_chjy6:_SChar:35:0y3:_fni5y3:_lfi3y3:_mbi8R62i2y3:_sslhy11:_lastRewardd-1y4:_newzy4:_petoy2:_ajR85:59:0y2:_ktggoR93nR94zR95y5:DavidR97tR67i85049789R70i8R98zR72d5.5R74oR68i5R69i4gR99zR100nR101jR102:41:0R103i5R104i3R105i8R62i2R106lhR107d-1R108zR109oR110jR85:55:0R111tggoR93nR94zR95y3:MiaR97fR67i85049786R70i8R98i1R72d10.5R74oR68i7R69i2gR99i-3R100nR101jR102:23:0R103i9R104i2R105i8R62zR106lhR107d-1R108zR109oR110jR85:51:0R111tggoR93nR94zR95y3:TomR97fR67i85049787R70i8R98zR72d8.5R74oR68i7R69i4gR99i1R100nR101jR102:24:0R103i6R104i5R105i8R62i2R106lhR107d-1R108zR109oR110jR85:49:0R111tggoR93nR94zR95y3:LouR97fR67i85049788R70i8R98i1R72d9R74oR68i5R69i6gR99i-1R100nR101jR102:20:0R103i9R104i4R105i8R62i4R106lhR107d-1R108zR109oR110jR85:66:0R111tggoR93nR94zR95y5:MarieR97fR67i85049790R70i8R98i1R72d7.5R74oR68i4R69i4gR99i1R100nR101jR102:3:0R103i5R104i4R105i8R62i4R106lhR107d-1R108zR109oR110jR85:51:0R111tgghy5:_seedi4081y3:_wmR2y9:_extraInvahy7:_ultimangy8:_picturefy4:_divd1y4:_hatoR97i1y3:_avazi9i1hgg"
        )
        U.allowUnregistered = true
        expect(() => U.unserialize()).not.toThrow()
    })
})

class Apples {
    value: number = 0
    constructor() {
        this.value = 5
    }
}
