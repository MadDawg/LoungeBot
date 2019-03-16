#!/usr/bin/env python3

#import requests
from lxml import html
from lxml import etree
import re
import argparse
from collections import deque

class Result:
    
    # may be useful
    #result_count = 0

    #def __init__(self, title="", similarity="", imgurl="", content=""):
    #    self.title = title
    #    self.similarity = similarity
    #    self.imgurl = imgurl
    #    self.content = content
    
    def __init__(self):
        self.creator = ""
        self.profile = ""
        self.title = ""
        self.imgurl = ""
        self.similarity = ""
        self.thumbnail = ""
        #self.booru = ""
        #self.content = ""


    def __repr__(self):
        return self.__str__()

    # return JSON string
    def __str__(self):
        try:
            #return '%s %s' % (self.creator, self.similarity)
            #return '{\"creator\":\"%s\",\"profile\":\"%s\",\"title\":\"%s\",\"imgurl\":\"%s\",\"similarity\":\"%s\",\"booru\":\"%s\"}' % (self.creator, self.profile, self.title, self.imgurl, self.similarity, self.booru)
            return '{\"creator\":\"%s\",\"profile\":\"%s\",\"title\":\"%s\",\"imgurl\":\"%s\",\"thumbnail\":\"%s\",\"similarity\":\"%s\"}' % (self.creator, self.profile, self.title, self.imgurl, self.thumbnail, self.similarity)
        except:
            return ''


    # image creator 
    def set_creator(self, creator): self.creator = creator

    # creator's profile (Pixiv, Seiga, etc.; just the url)
    def set_profile(self, profile): self.profile = profile

    # title of work
    def set_title(self, title): self.title = title

    # image url (pixiv page, raw url in case of boorus, etc.)
    def set_imgurl(self, imgurl): self.imgurl = imgurl

    # search similarity
    def set_similarity(self, similarity): self.similarity = similarity

    # extra information
    def set_content(self, content): self.content = content
    
    def set_thumbnail(self, thumbnail): self.thumbnail = thumbnail

    #def set_booru(self, booru): self.booru = booru
    
    def noop(self, arg=0): return

# add HTML5 boilerplate
def boil(raw_data):
    # lazy check to see if we have a full HTML document or just the result divs
    if "<!doctype" in raw_data or "<!DOCTYPE" in raw_data:
        return raw_data

    opening = "<!doctype html><html><head><title>Sauce Found?</title></head><body>"
    closing = "</body></html>"
    data = opening + raw_data + closing
    return data

def parse_html(data, low_similarity=False):
    tree = html.fromstring(data)
    #results = tree.xpath(result_expr)
    body = tree.find("body")
    if body is None:
        body = tree
    
    # loop through every result div and grab the info want
    results = []
    for i in range(0,len(body)):
        try:
            result = Result()
            # instead of using full xpath strings,
            # we'll basically treat this as a list (see lxml docs)
            # also, since all of these elements are in the same relative locations
            # with respect to the body element, things are further simplified
            # e.g. "html/body/div#mainarea/div#middle/div.result/table.resulttable/tbody/tr/td.resulttableimage"
            # shortens to "html/body/div/div/div/table/tbody/tr/td" (rather, ".../tbody/tr[0]")
            # which becomes what is seen below
            resulttableimage = body[i][0][0][0][0]
            resulttablecontent = body[i][0][0][0][1]
            resultmatchinfo = resulttablecontent[0]
            resultsimilarityinfo = resultmatchinfo[0]
            similarity = resultsimilarityinfo.text

            resultmiscinfo = resultmatchinfo[1]
        
            resultimage = resulttableimage[0]
            try:
                if resultimage[0][0].tag == "img":
                    url = re.findall(r'src="(.+?)"',etree.tostring(resultimage[0], encoding='unicode'))[0]
                    result.set_thumbnail(url)
            except: raise

            try:
                # eh, just grab the first one
                if resultmiscinfo[0].tag == "a":
                    #result.set_booru(re.findall(r'href="(.+?)"',etree.tostring(resultmiscinfo[0], encoding='unicode'))[0])
                    result.set_imgurl(re.findall(r'href="(.+?)"',etree.tostring(resultmiscinfo[0], encoding='unicode'))[0])
            except:
                pass
            
            resultcontent = resulttablecontent[1]
            resulttitle = resultcontent[0]
            titlestrong = resulttitle[0].text
            
            if titlestrong == "Creator: ":
                creator = re.findall(r"</strong>(.+?)<br/>",etree.tostring(resulttitle, encoding='unicode'))[0]
                result.set_creator(creator)
            else:
                result.set_title(titlestrong)

            #resulttablecolumn = resultcontent[1]
            # gotta watch those hardcoded array accessors
            for i in range(1, len(resultcontent)):
                try:
                    if "ID:" in resultcontent[i][0].text:
                        if resultcontent[i][1].tag == "a":
                            result.set_imgurl(re.findall(r'href="(.+?)"',etree.tostring(resultcontent[i][1], encoding='unicode'))[0])
                        for j in range(0,len(resultcontent[i])):
                            try:
                                if "Author:" in resultcontent[i][j].text or "Member:" in resultcontent[i][j].text:
                                    if resultcontent[i][j+1].tag == "a":
                                        result.set_profile(re.findall(r'href="(.+?)"',etree.tostring(resultcontent[i][j+1], encoding='unicode'))[0])
                                        result.set_creator(re.findall(r'"linkify">(.+?)</a>',etree.tostring(resultcontent[i][j+1], encoding='unicode'))[0])
                                        break # we're done here
                            except: pass
                except TypeError:
                    pass

            result.set_similarity(similarity)
            results.append(result)
            #print(result)
        except IndexError:
            if low_similarity: pass
            else: break
    
    return results

def main():
    parser = argparse.ArgumentParser(description='convert SauceNao results into JSON strings')
    parser.add_argument('html', help='HTML string to be parsed', action='store')
    parser.add_argument('-a', '--all', '--all-results',
            help='include low similarity results',
            action='store_true')

    args = parser.parse_args()

    data = boil(args.html)
    json = parse_html(data, args.all)
    print(json)


main()
